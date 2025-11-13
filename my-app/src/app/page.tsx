// app/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Check, Copy, Loader2 } from 'lucide-react';

export default function ImageUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件拖放
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0] || null;
    handleFileSelection(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelection(file);
    // 重置输入以允许重复选择同一文件
    e.target.value = '';
  };

  const handleFileSelection = (file: File | null) => {
    if (!file) return;

    setSelectedFile(file);

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
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

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // 上传成功后自动滚动到预览区
  useEffect(() => {
    if (uploadedUrl) {
      const previewElement = document.getElementById('preview-container');
      previewElement?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [uploadedUrl]);

  return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
        {/* 顶部导航 */}
        <header className="border-b border-gray-200 dark:border-gray-700 py-4 px-6 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              PicUpload
            </h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              简单高效的图片上传工具
            </div>
          </div>
        </header>

        {/* 主内容区 */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 max-w-5xl w-full mx-auto w-full">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              轻松上传并分享图片
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              支持拖拽上传，自动生成可分享链接，简单高效
            </p>
          </div>

          {/* 上传区域 */}
          <div
              className={`
            w-full border-2 border-dashed rounded-xl p-8 sm:p-12 transition-all duration-300
            ${dragOver
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'}
            ${uploadedUrl ? 'mb-8' : ''}
          `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
          >
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
            />

            <div className="text-center">
              <div className={`
              w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
              ${dragOver
                  ? 'bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}
            `}>
                <Upload size={28} />
              </div>

              <h3 className="text-lg font-medium mb-2">拖放图片到此处或点击上传</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                支持 JPG、PNG、WebP 等格式，最大 10MB
              </p>

              {selectedFile ? (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg inline-flex items-center gap-2">
                    <ImageIcon size={16} className="text-blue-500" />
                    <span className="text-sm truncate max-w-xs">{selectedFile.name}</span>
                    <span className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
                  </div>
              ) : (
                  <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerFileSelect();
                      }}
                      className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    选择图片
                  </button>
              )}
            </div>
          </div>

          {/* 上传按钮 */}
          {selectedFile && !uploadedUrl && (
              <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full max-w-md bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>上传中...</span>
                    </>
                ) : (
                    <>
                      <Upload size={18} />
                      <span>开始上传</span>
                    </>
                )}
              </button>
          )}

          {/* 错误提示 */}
          {error && (
              <div className="mt-4 w-full max-w-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">
                {error}
              </div>
          )}

          {/* 上传成功预览区 */}
          {uploadedUrl && (
              <div id="preview-container" className="w-full max-w-2xl mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">上传成功</h3>
                  <div className="flex items-center gap-1 text-green-500 text-sm">
                    <Check size={16} />
                    <span>已完成</span>
                  </div>
                </div>

                <div className="mb-5 border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
                  <img
                      src={uploadedUrl}
                      alt="预览"
                      className="w-full h-auto object-contain max-h-64 sm:max-h-80 mx-auto block"
                      loading="lazy"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                      type="text"
                      value={uploadedUrl}
                      readOnly
                      className="flex-1 p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 overflow-hidden text-ellipsis"
                  />
                  <button
                      onClick={handleCopy}
                      className={`p-2.5 rounded-lg transition-colors ${
                          copied
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
                      }`}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>

                <div className="mt-4 flex justify-between">
                  <button
                      onClick={() => {
                        setSelectedFile(null);
                        setUploadedUrl('');
                      }}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    上传另一张图片
                  </button>
                  <button
                      onClick={() => window.open(uploadedUrl, '_blank')}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    在新窗口查看
                  </button>
                </div>
              </div>
          )}
        </main>

        {/* 页脚 */}
        <footer className="py-6 px-4 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-5xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} PicUpload - 简单高效的图片上传工具
          </div>
        </footer>
      </div>
  );
}