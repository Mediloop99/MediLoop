import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import logo from "@/assets/logo.png";

interface ScanRecord {
  id: number;
  timestamp: string;
  expiryDate: string;
  rawText: string;
  status: "verified" | "expired" | "warning";
}

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ScanRecord[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("scanHistory");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="w-6 h-6 text-success" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-warning" />;
      case "expired":
        return <XCircle className="w-6 h-6 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            onClick={() => navigate("/scan")}
            variant="ghost"
            size="icon"
            className="mr-4"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <img src={logo} alt="MediLoop" className="h-12 w-auto" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-6">Scan History</h1>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No scans yet</p>
            <Button
              onClick={() => navigate("/scan")}
              className="mt-4"
            >
              Start Scanning
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((record) => (
              <Card key={record.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(record.status)}
                      <span className="font-semibold capitalize">{record.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Scanned: {new Date(record.timestamp).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expiry: {new Date(record.expiryDate).toLocaleDateString()}
                    </p>
                    {record.rawText && (
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        {record.rawText}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
