// app/page.tsx
'use client';

import { useState } from 'react';

export default function ImageUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);

    // 验证文件类型
    if (file && !file.type.startsWith('image/')) {
      setError('请选择图片文件（JPG、PNG等）');
      setSelectedFile(null);
    } else {
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('请先选择图片文件');
      return;
    }

    setUploading(true);
    setError('');
    setCopied(false);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '上传失败，请重试');
      }

      setUploadedUrl(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传过程中发生错误');
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = () => {
    if (uploadedUrl) {
      navigator.clipboard.writeText(uploadedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-8">图片上传到MinIO</h1>

        <div className="w-full max-w-md border rounded-lg p-6 shadow-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">选择图片文件</label>
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-2 border rounded"
            />
          </div>

          {selectedFile && (
              <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                已选择: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </div>
          )}

          <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:bg-gray-400 transition"
          >
            {uploading ? '上传中...' : '上传图片'}
          </button>

          {error && (
              <div className="mt-4 text-red-500 text-sm">{error}</div>
          )}

          {uploadedUrl && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/30 rounded">
                <p className="mb-2 font-medium">上传成功！</p>
                <div className="flex items-center gap-2">
                  <input
                      type="text"
                      value={uploadedUrl}
                      readOnly
                      className="flex-1 p-2 border rounded text-sm overflow-hidden text-ellipsis"
                  />
                  <button
                      onClick={handleCopy}
                      className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 p-2 rounded"
                  >
                    {copied ? '已复制' : '复制'}
                  </button>
                </div>
                <div className="mt-3">
                  <img
                      src={uploadedUrl}
                      alt="预览"
                      className="max-w-full max-h-40 object-contain rounded"
                  />
                </div>
              </div>
          )}
        </div>
      </div>
  );
}