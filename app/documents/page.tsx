"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Upload, 
  FileText, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Loader2,
  FileType,
  ArrowLeft
} from "lucide-react";

interface Document {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  title: string | null;
  description: string | null;
  status: "PENDING" | "PROCESSING" | "INDEXED" | "FAILED";
  chunkCount: number;
  errorMessage: string | null;
  createdAt: string;
}

export default function DocumentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (
      status === "authenticated" &&
      adminEmail &&
      session?.user?.email !== adminEmail
    ) {
      router.push("/chat");
    }
  }, [status, router, session, adminEmail]);

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    try {
      const response = await fetch("/api/documents");
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchDocuments();
    }
  }, [session, fetchDocuments]);

  // Handle file upload
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          setUploadError(data.error || "Upload failed");
        } else {
          // Refresh document list
          await fetchDocuments();
        }
      } catch (error) {
        console.error("Upload error:", error);
        setUploadError("Failed to upload file");
      }
    }

    setIsUploading(false);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleUpload(e.dataTransfer.files);
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Status badge
  const StatusBadge = ({ status }: { status: Document["status"] }) => {
    switch (status) {
      case "INDEXED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
            <CheckCircle size={12} /> Indexed
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
            <Loader2 size={12} className="animate-spin" /> Processing
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
            <XCircle size={12} /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
            Pending
          </span>
        );
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0a0d10 0%, #0f1419 100%)"
      }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "#06b6d4" }} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0a0d10 0%, #0f1419 100%)",
      padding: "24px",
    }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <button
            onClick={() => router.push("/chat")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#67e8f9",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            <ArrowLeft size={16} /> Back to Chat
          </button>
          <h1 style={{ 
            fontSize: "28px", 
            fontWeight: "700", 
            color: "#fff",
            marginBottom: "8px"
          }}>
            My Documents
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
            Upload documents to give your Digital Twin knowledge about you
          </p>
        </div>

        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragActive ? "#06b6d4" : "rgba(6, 182, 212, 0.3)"}`,
            borderRadius: "16px",
            padding: "48px",
            textAlign: "center",
            marginBottom: "32px",
            background: dragActive ? "rgba(6, 182, 212, 0.1)" : "rgba(0,0,0,0.2)",
            transition: "all 0.2s",
          }}
        >
          <Upload 
            size={48} 
            style={{ 
              color: dragActive ? "#06b6d4" : "#67e8f9", 
              marginBottom: "16px" 
            }} 
          />
          <p style={{ 
            color: "#fff", 
            fontSize: "16px", 
            marginBottom: "8px",
            fontWeight: "600"
          }}>
            Drag & drop files here
          </p>
          <p style={{ 
            color: "rgba(255,255,255,0.5)", 
            fontSize: "14px",
            marginBottom: "16px"
          }}>
            or click to browse
          </p>
          <input
            type="file"
            accept=".pdf,.docx,.txt,.md"
            multiple
            onChange={(e) => handleUpload(e.target.files)}
            style={{ display: "none" }}
            id="file-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="file-upload"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              background: "linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)",
              color: "#0a0d10",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: isUploading ? "not-allowed" : "pointer",
              opacity: isUploading ? 0.7 : 1,
            }}
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <Upload size={18} /> Select Files
              </>
            )}
          </label>
          <p style={{ 
            color: "rgba(255,255,255,0.4)", 
            fontSize: "12px",
            marginTop: "16px"
          }}>
            Supported: PDF, DOCX, TXT, Markdown (max 10MB)
          </p>
        </div>

        {/* Error Message */}
        {uploadError && (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "24px",
            color: "#fca5a5",
            fontSize: "14px",
          }}>
            {uploadError}
          </div>
        )}

        {/* Documents List */}
        <div>
          <h2 style={{ 
            fontSize: "18px", 
            fontWeight: "600", 
            color: "#fff",
            marginBottom: "16px"
          }}>
            Uploaded Documents ({documents.length})
          </h2>

          {documents.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "48px",
              color: "rgba(255,255,255,0.5)",
            }}>
              <FileText size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
              <p>No documents uploaded yet</p>
              <p style={{ fontSize: "14px", marginTop: "8px" }}>
                Upload your resume, portfolio, or other documents to get started
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "8px",
                    background: "rgba(6, 182, 212, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <FileType size={24} style={{ color: "#06b6d4" }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ 
                      color: "#fff", 
                      fontWeight: "600",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {doc.title || doc.filename}
                    </p>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "12px",
                      marginTop: "4px",
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.5)"
                    }}>
                      <span>{doc.fileType.toUpperCase()}</span>
                      <span>•</span>
                      <span>{formatSize(doc.fileSize)}</span>
                      {doc.chunkCount > 0 && (
                        <>
                          <span>•</span>
                          <span>{doc.chunkCount} chunks</span>
                        </>
                      )}
                    </div>
                  </div>

                  <StatusBadge status={doc.status} />

                  <button
                    onClick={() => handleDelete(doc.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#9ca3af",
                      cursor: "pointer",
                      padding: "8px",
                      borderRadius: "8px",
                      transition: "all 0.2s",
                    }}
                    title="Delete document"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
