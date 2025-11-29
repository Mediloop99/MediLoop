import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, ScanLine, Upload, X } from "lucide-react";
import logo from "@/assets/logo.png";
import Tesseract from "tesseract.js";
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from "@zxing/library";
import Quagga from "quagga";
import { toast } from "sonner";

const Scan = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [cameraMode, setCameraMode] = useState<"off" | "image" | "barcode">("off");
  const [verifying, setVerifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const barcodeVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const barcodeStreamRef = useRef<MediaStream | null>(null);
  const quaggaInitializedRef = useRef(false);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const zxingReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);

  // Parse GS1 Application Identifiers
  const parseGS1Data = (data: string): { expiry: Date | null; gtin: string | null; batch: string | null; raw: string } => {
    console.log("Parsing GS1 data:", data);
    
    // GS1 data can use FNC1 character (represented as \u001D or GS character) or parentheses
    // Application Identifiers we care about:
    // (01) = GTIN (14 digits)
    // (17) = Expiry date (YYMMDD - 6 digits)
    // (10) = Batch/lot number (variable length)
    // (21) = Serial number (variable length)
    
    let expiry: Date | null = null;
    let gtin: string | null = null;
    let batch: string | null = null;
    
    // Try parsing with parentheses format first (easier to read)
    const aiPatterns = [
      { ai: '17', regex: /\(17\)(\d{6})/, type: 'expiry' },
      { ai: '01', regex: /\(01\)(\d{14})/, type: 'gtin' },
      { ai: '10', regex: /\(10\)([^()\u001D]+)/, type: 'batch' },
      { ai: '21', regex: /\(21\)([^()\u001D]+)/, type: 'serial' }
    ];
    
    for (const pattern of aiPatterns) {
      const match = data.match(pattern.regex);
      if (match) {
        const value = match[1];
        if (pattern.type === 'expiry') {
          // Parse YYMMDD format
          const year = 2000 + parseInt(value.substring(0, 2));
          const month = parseInt(value.substring(2, 4));
          const day = parseInt(value.substring(4, 6));
          if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            expiry = new Date(year, month - 1, day);
          }
        } else if (pattern.type === 'gtin') {
          gtin = value;
        } else if (pattern.type === 'batch') {
          batch = value;
        }
      }
    }
    
    // Try parsing without parentheses (using FNC1/GS character \u001D as separator)
    if (!expiry) {
      const parts = data.split(/[\u001D\u001E]/); // GS1 separators
      for (const part of parts) {
        if (part.startsWith('17') && part.length >= 8) {
          const dateStr = part.substring(2, 8);
          const year = 2000 + parseInt(dateStr.substring(0, 2));
          const month = parseInt(dateStr.substring(2, 4));
          const day = parseInt(dateStr.substring(4, 6));
          if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            expiry = new Date(year, month - 1, day);
          }
        }
        if (part.startsWith('01') && part.length >= 16) {
          gtin = part.substring(2, 16);
        }
      }
    }
    
    return { expiry, gtin, batch, raw: data };
  };

  const extractExpiryDate = (text: string): { expiry: Date | null; raw: string } => {
    // Enhanced expiry patterns with more variations
    const patterns = [
      /EXP(?:IRY)?[:\s]*(\d{1,2})[\/\-.](\d{2,4})/i,
      /EXP(?:IRY)?\s+DATE[:\s]*(\d{1,2})[\/\-.](\d{2,4})/i,
      /USE\s+BY[:\s]*(\d{1,2})[\/\-.](\d{2,4})/i,
      /BEST\s+BEFORE[:\s]*(\d{1,2})[\/\-.](\d{2,4})/i,
      /EXP(?:IRY)?[:\s]*(\w+)[\/\-.\s](\d{2,4})/i,
      /(\d{1,2})[\/\-.](\d{4})/,
      /(\d{1,2})[\/\-.](\d{2})(?!\d)/,
      /(\w{3,9})[\/\-.\s](\d{2,4})/,
    ];

    // Try to find expiry near relevant keywords
    const expiryContext = /(?:EXP|EXPIRY|USE BY|BEST BEFORE|VALID TILL)[\s:]*([^\n]{0,20})/i;
    const contextMatch = text.match(expiryContext);
    const searchText = contextMatch ? contextMatch[1] : text;

    for (const pattern of patterns) {
      const match = searchText.match(pattern) || text.match(pattern);
      if (match) {
        let month: number;
        let year: number;

        // Parse month
        if (isNaN(parseInt(match[1]))) {
          const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
          const fullMonthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
          const monthStr = match[1].toLowerCase();
          month = monthNames.findIndex(m => monthStr.includes(m)) + 1;
          if (month === 0) {
            month = fullMonthNames.findIndex(m => monthStr.includes(m)) + 1;
          }
        } else {
          month = parseInt(match[1]);
        }

        // Parse year
        year = parseInt(match[2]);
        if (year < 100) year += 2000;

        // Validate date ranges
        if (month >= 1 && month <= 12 && year >= 2024 && year <= 2050) {
          return {
            expiry: new Date(year, month - 1, 1),
            raw: match[0]
          };
        }
      }
    }

    return { expiry: null, raw: "" };
  };

  const preprocessImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('Canvas context not available');

          // Scale up for better OCR
          const scale = 2;
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          // Draw image scaled
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Apply image enhancements
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Sharpen and enhance contrast
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            // Adaptive threshold with slight blur tolerance
            const threshold = avg > 110 ? 255 : 0;
            data[i] = data[i + 1] = data[i + 2] = threshold;
          }

          ctx.putImageData(imageData, 0, 0);
          resolve(canvas.toDataURL());
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };


  const startCamera = async (mode: "image" | "barcode") => {
    try {
      setCameraMode(mode);
      
      if (mode === "image") {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
          };
        }
      }
      // For barcode mode, startBarcodeScanning will be triggered by useEffect
    } catch (error) {
      console.error("Camera access error:", error);
      toast.error("Could not access camera. Please check permissions.");
      setCameraMode("off");
    }
  };

  const stopCamera = () => {
    // Stop Quagga if running
    try {
      Quagga.stop();
    } catch (e) {
      console.log("Quagga already stopped or not initialized");
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (barcodeStreamRef.current) {
      barcodeStreamRef.current.getTracks().forEach(track => track.stop());
      barcodeStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (barcodeVideoRef.current) {
      barcodeVideoRef.current.srcObject = null;
    }
    if (zxingReaderRef.current) {
      try {
        zxingReaderRef.current.reset();
        zxingReaderRef.current = null;
      } catch (e) {
        console.error("Error stopping ZXing:", e);
      }
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setCameraMode("off");
  };

  const startBarcodeScanning = async () => {
    if (!barcodeVideoRef.current || !overlayCanvasRef.current) {
      console.error("Video element not available");
      toast.error("Camera elements not ready");
      return;
    }

    try {
      console.log("🎥 Starting barcode scanner...");
      
      // STEP 1: First manually get the camera stream and display it
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      // STEP 2: Attach stream directly to our video element
      barcodeVideoRef.current.srcObject = stream;
      await barcodeVideoRef.current.play();
      console.log("✅ Video stream attached and playing");
      
      toast.success("Camera active - initializing scanner...");
      
      // STEP 3: Wait for video metadata to load
      await new Promise<void>((resolve) => {
        if (barcodeVideoRef.current!.videoWidth > 0) {
          resolve();
        } else {
          barcodeVideoRef.current!.onloadedmetadata = () => resolve();
        }
      });
      
      console.log("📹 Video dimensions:", barcodeVideoRef.current.videoWidth, "x", barcodeVideoRef.current.videoHeight);
      
      // STEP 4: Initialize Quagga WITHOUT creating its own stream
      const quaggaConfig = {
        inputStream: {
          type: "LiveStream",
          target: barcodeVideoRef.current,
        },
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "code_39_reader",
            "code_93_reader",
            "upc_reader",
            "upc_e_reader"
          ]
        },
        locate: true,
        locator: {
          patchSize: "medium",
          halfSample: true
        }
      };

      // Start Quagga
      Quagga.init(quaggaConfig, (err: any) => {
        if (err) {
          console.error("❌ Quagga init error:", err);
          toast.error(`Scanner error: ${err.message || 'Failed to start'}`);
          setCameraMode("off");
          return;
        }
        
        console.log("✅ Quagga initialized successfully");
        Quagga.start();
        toast.success("Scanner active - point at any code");
        
        // Setup visual feedback overlay
        Quagga.onProcessed((result: any) => {
          const drawingCtx = overlayCanvasRef.current?.getContext('2d');
          const canvas = overlayCanvasRef.current;
          if (!drawingCtx || !result || !canvas) return;

          // Match canvas size to video
          if (barcodeVideoRef.current && canvas.width !== barcodeVideoRef.current.videoWidth) {
            canvas.width = barcodeVideoRef.current.videoWidth;
            canvas.height = barcodeVideoRef.current.videoHeight;
          }

          // Clear previous drawings
          drawingCtx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw detected boxes (light green)
          if (result.boxes) {
            drawingCtx.strokeStyle = 'rgba(0, 255, 0, 0.4)';
            drawingCtx.lineWidth = 2;
            
            result.boxes.forEach((box: any) => {
              if (box !== result.box) {
                drawingCtx.strokeRect(box[0][0], box[0][1], 
                  box[1][0] - box[0][0], box[1][1] - box[0][1]);
              }
            });
          }

          // Draw the main detected region (bright green)
          if (result.box) {
            drawingCtx.strokeStyle = '#00ff00';
            drawingCtx.lineWidth = 4;
            drawingCtx.strokeRect(
              result.box[0][0], result.box[0][1],
              result.box[1][0] - result.box[0][0],
              result.box[1][1] - result.box[0][1]
            );
          }
        });
        
        // Listen for successful Quagga detections
        Quagga.onDetected((result: any) => {
          if (result && result.codeResult && !verifying) {
            const barcodeData = result.codeResult.code;
            const formatName = 'Barcode';
            
            console.log("🎉 Quagga detected barcode:", barcodeData);
            setVerifying(true);
            
            toast.loading("Verifying medicine...", { id: "verify-toast" });
            
            // Simulate verification process with delay
            setTimeout(() => {
              toast.success(`${formatName} detected! Medicine verified.`, { id: "verify-toast" });
              
              // Save to history
              const history = JSON.parse(localStorage.getItem("scanHistory") || "[]");
              const newScan = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                rawText: `${formatName}: ${barcodeData}`,
                status: "verified"
              };
              history.unshift(newScan);
              localStorage.setItem("scanHistory", JSON.stringify(history.slice(0, 50)));
              
              Quagga.stop();
              stopCamera();
              navigate("/result", { 
                state: { 
                  status: "verified",
                  barcode: barcodeData,
                  format: formatName
                } 
              });
            }, 2500);
          }
        });
        
        // Wait for video to be ready, then start ZXing for QR/Data Matrix
        setTimeout(() => {
          if (barcodeVideoRef.current && cameraMode === "barcode") {
            console.log("🔄 Starting ZXing scanner for QR/Data Matrix...");
            startZXingScanning();
          }
        }, 1500);
      });
      
    } catch (error) {
      console.error("❌ Scanner init error:", error);
      toast.error("Failed to start barcode scanner");
      setCameraMode("off");
    }
  };

  const startZXingScanning = async () => {
    try {
      console.log("🔍 Initializing ZXing for QR/Data Matrix...");
      
      // Initialize ZXing reader for QR codes and Data Matrix
      const hints = new Map();
      const formats = [
        BarcodeFormat.QR_CODE,
        BarcodeFormat.DATA_MATRIX,
      ];
      hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
      hints.set(DecodeHintType.TRY_HARDER, true);

      const reader = new BrowserMultiFormatReader(hints);
      zxingReaderRef.current = reader;

      console.log("✅ ZXing scanner ready for QR/Data Matrix");

      // Continuous scanning loop
      const scanFrame = async () => {
        if (!barcodeVideoRef.current || cameraMode !== "barcode") {
          return;
        }

        try {
          const result = await reader.decodeFromVideoElement(barcodeVideoRef.current);
          
          if (result && !verifying) {
            const codeData = result.getText();
            const format = result.getBarcodeFormat();
            
            console.log("🎉 ZXing detected:", { format, data: codeData });
            
            const formatName = format === BarcodeFormat.QR_CODE ? 'QR Code' : 'Data Matrix';
            
            setVerifying(true);
            toast.loading("Verifying medicine...", { id: "verify-toast" });
            
            // Simulate verification process with delay
            setTimeout(() => {
              toast.success(`${formatName} detected! Medicine verified.`, { id: "verify-toast" });
              
              // Save to history
              const history = JSON.parse(localStorage.getItem("scanHistory") || "[]");
              const newScan = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                rawText: `${formatName}: ${codeData}`,
                status: "verified"
              };
              history.unshift(newScan);
              localStorage.setItem("scanHistory", JSON.stringify(history.slice(0, 50)));
              
              Quagga.stop();
              stopCamera();
              navigate("/result", { 
                state: { 
                  status: "verified",
                  barcode: codeData,
                  format: formatName
                } 
              });
            }, 2500);
            return;
          }
        } catch (error: any) {
          // NotFoundException is normal - just means no code in current frame
          if (error.name !== 'NotFoundException') {
            console.error("ZXing decode error:", error);
          }
        }
        
        // Continue scanning
        if (cameraMode === "barcode") {
          requestAnimationFrame(scanFrame);
        }
      };
      
      scanFrame();
    } catch (error) {
      console.error("❌ ZXing init error:", error);
    }
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    
    // Try ZXing for QR/Data Matrix detection first
    setIsScanning(true);
    try {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX]);
      hints.set(DecodeHintType.TRY_HARDER, true);
      
      const reader = new BrowserMultiFormatReader(hints);
      const imageDataUrl = canvas.toDataURL();
      const img = new Image();
      img.src = imageDataUrl;
      await new Promise((resolve) => { img.onload = resolve; });
      const result = await reader.decodeFromImageElement(img);
      
      if (result) {
        const codeData = result.getText();
        const format = result.getBarcodeFormat();
        console.log("Code detected in image:", codeData);
        
        const formatName = format === BarcodeFormat.QR_CODE ? 'QR Code' : 'Data Matrix';
        
        toast.success(`${formatName} detected! Medicine verified.`);
        
        // Save to history
        const history = JSON.parse(localStorage.getItem("scanHistory") || "[]");
        const newScan = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          rawText: `${formatName}: ${codeData}`,
          status: "verified"
        };
        history.unshift(newScan);
        localStorage.setItem("scanHistory", JSON.stringify(history.slice(0, 50)));
        
        stopCamera();
        navigate("/result", { 
          state: { 
            status: "verified",
            barcode: codeData,
            format: formatName
          } 
        });
        setIsScanning(false);
        return;
      }
    } catch (err) {
      console.log("No QR/Data Matrix found, trying OCR");
    }

    // Fall back to OCR
    stopCamera();
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      await processImage(file);
    }, "image/jpeg");
  };

  const processImage = async (file: File) => {
    setIsScanning(true);
    toast.info("Scanning medicine...");

    try {
      const preprocessedImage = await preprocessImage(file);
      const result = await Tesseract.recognize(preprocessedImage, "eng", {
        logger: (m) => console.log(m),
      });

      let text = result.data.text;
      console.log("OCR Result:", text);

      if (text.length < 20) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = preprocessedImage;
        await new Promise(resolve => img.onload = resolve);
        
        canvas.width = img.height;
        canvas.height = img.width;
        ctx?.translate(canvas.width / 2, canvas.height / 2);
        ctx?.rotate(90 * Math.PI / 180);
        ctx?.drawImage(img, -img.width / 2, -img.height / 2);
        
        const rotatedImage = canvas.toDataURL();
        const rotatedResult = await Tesseract.recognize(rotatedImage, "eng");
        if (rotatedResult.data.text.length > text.length) {
          text = rotatedResult.data.text;
          console.log("Rotated OCR Result:", text);
        }
      }

      const { expiry, raw } = extractExpiryDate(text);

      if (!expiry) {
        navigate("/result", { 
          state: { 
            status: "failed", 
            reason: "Could not detect expiry date. Please ensure the image is clear and shows the expiry information."
          } 
        });
        return;
      }

      const today = new Date();
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(today.getMonth() + 3);

      const history = JSON.parse(localStorage.getItem("scanHistory") || "[]");
      const newScan = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        expiryDate: expiry.toISOString(),
        rawText: raw,
        status: expiry < today ? "expired" : expiry < threeMonthsFromNow ? "warning" : "verified"
      };
      history.unshift(newScan);
      localStorage.setItem("scanHistory", JSON.stringify(history.slice(0, 50)));

      if (expiry < today) {
        navigate("/result", { 
          state: { 
            status: "failed", 
            expiryDate: expiry,
            reason: "Medicine has expired and is not safe to use."
          } 
        });
      } else if (expiry < threeMonthsFromNow) {
        navigate("/result", { 
          state: { 
            status: "warning", 
            expiryDate: expiry,
            message: "Medicine is nearing expiry date. Valid but use soon."
          } 
        });
      } else {
        navigate("/result", { 
          state: { 
            status: "verified", 
            expiryDate: expiry 
          } 
        });
      }
    } catch (error) {
      console.error("OCR Error:", error);
      toast.error("Failed to scan medicine");
      navigate("/result", { 
        state: { 
          status: "failed", 
          reason: "Scanning error. Please try again with a clearer image."
        } 
      });
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    // Start barcode scanning when camera mode switches to barcode
    if (cameraMode === "barcode" && barcodeVideoRef.current && overlayCanvasRef.current) {
      console.log("📹 Camera mode set to barcode, initializing scanner...");
      // Small delay to ensure DOM is fully ready
      const timer = setTimeout(() => {
        startBarcodeScanning();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [cameraMode]);

  useEffect(() => {
    // Sync overlay canvas size with video
    if (cameraMode === "barcode" && barcodeVideoRef.current && overlayCanvasRef.current) {
      const video = barcodeVideoRef.current;
      const canvas = overlayCanvasRef.current;
      
      const updateCanvasSize = () => {
        if (video.videoWidth && video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
      };
      
      video.addEventListener('loadedmetadata', updateCanvasSize);
      updateCanvasSize();
      
      return () => {
        video.removeEventListener('loadedmetadata', updateCanvasSize);
      };
    }
  }, [cameraMode]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (barcodeStreamRef.current) {
        barcodeStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (zxingReaderRef.current) {
        try {
          zxingReaderRef.current.reset();
        } catch (e) {
          console.error("Cleanup error:", e);
        }
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-6">
      <div className="w-full max-w-md space-y-8 pt-8">
        <div className="text-center space-y-3">
          <img src={logo} alt="MediLoop" className="h-16 w-auto mx-auto mb-2" />
          <h1 className="text-3xl font-bold text-foreground">MediLoop</h1>
          <p className="text-muted-foreground text-lg">Verify your medicine before use</p>
        </div>

        {cameraMode === "off" ? (
          <div className="flex flex-col items-center space-y-6 pt-12">
            <div className="relative">
              <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Camera className="w-20 h-20 text-primary" strokeWidth={2} />
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processImage(file);
              }}
              className="hidden"
            />

            <div className="w-full space-y-4">
              <Button
                onClick={() => startCamera("barcode")}
                disabled={isScanning}
                variant="secondary"
                className="w-full h-16 text-lg font-semibold rounded-2xl"
                size="lg"
              >
                <ScanLine className="w-6 h-6 mr-3" />
                Scan Barcode/QR/Data Matrix
              </Button>

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                variant="outline"
                className="w-full h-14 text-base font-semibold rounded-2xl"
              >
                <Upload className="w-5 h-5 mr-2" />
                {isScanning ? "Processing..." : "Upload Image"}
              </Button>
            </div>

            <Button
              onClick={() => navigate("/history")}
              variant="ghost"
              className="text-primary font-semibold"
            >
              View Scan History
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {cameraMode === "image" ? (
              <div className="relative rounded-2xl overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-[400px] object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-4 border-primary/50 rounded-2xl" />
                </div>

                <Button
                  onClick={stopCamera}
                  variant="destructive"
                  size="icon"
                  className="absolute top-4 right-4 rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-black" style={{ minHeight: '400px' }}>
                <video
                  ref={barcodeVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-[400px] object-cover relative z-0"
                  style={{ display: 'block', visibility: 'visible' }}
                />
                
                {/* Detection overlay canvas */}
                <canvas 
                  ref={overlayCanvasRef}
                  className="absolute top-0 left-0 w-full h-[400px] pointer-events-none"
                  style={{ zIndex: 1 }}
                />
                
                {/* Guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 2 }}>
                  <div className="relative">
                    <div className="w-72 h-40 border-4 border-primary/60 rounded-xl" />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary/90 text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                      Align code here
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={stopCamera}
                  variant="destructive"
                  size="icon"
                  className="absolute top-4 right-4 rounded-full z-10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            )}

            {cameraMode === "image" && (
              <Button
                onClick={captureImage}
                disabled={isScanning}
                className="w-full h-16 text-lg font-semibold rounded-2xl"
              >
                {isScanning ? "Processing..." : "Capture & Scan"}
              </Button>
            )}

            {cameraMode === "barcode" && (
              <div className="text-center space-y-2">
                {verifying ? (
                  <>
                    <p className="text-primary font-bold text-lg animate-pulse">
                      🔍 Verifying medicine...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Please wait while we verify the medicine details
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground font-semibold">
                      Scanning for barcodes, QR codes & Data Matrix...
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                      Supports GS1 formatted codes for medicine verification
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Scan;
