import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Folder, FileText, Trash2, FolderPlus, FilePlus, ArrowLeft, Loader2, RefreshCw, UploadCloud, Upload, Download } from 'lucide-react';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';
import { useRef } from 'react';

export const FileManager = () => {
  const [currentPath, setCurrentPath] = useState('/home/deepdp');
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async (path: string) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/admin/fs/list?path=${encodeURIComponent(path)}`);
      setFiles(res.data);
      setCurrentPath(path);
    } catch (err) {
      toast.error('Failed to load directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentPath);
  }, []);

  const handleNavigate = (folderName: string) => {
    const newPath = currentPath.endsWith('/') ? `${currentPath}${folderName}` : `${currentPath}/${folderName}`;
    fetchFiles(newPath);
  };

  const handleGoUp = () => {
    if (currentPath === '/' || currentPath === '') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    const newPath = '/' + parts.join('/');
    fetchFiles(newPath || '/');
  };

  const handleCreateFolder = async () => {
    const name = prompt('Enter new folder name:');
    if (!name) return;
    try {
      await apiClient.post('/admin/fs/mkdir', { dirPath: currentPath, name });
      toast.success('Folder created');
      fetchFiles(currentPath);
    } catch (err) {
      toast.error('Failed to create folder');
    }
  };

  const handleCreateFile = async () => {
    const name = prompt('Enter new file name (e.g. index.html):');
    if (!name) return;
    try {
      await apiClient.post('/admin/fs/create', { dirPath: currentPath, name, content: '' });
      toast.success('File created');
      fetchFiles(currentPath);
    } catch (err) {
      toast.error('Failed to create file');
    }
  };

  const handleDelete = async (name: string, isDir: boolean) => {
    if (!confirm(`Are you sure you want to delete the ${isDir ? 'folder' : 'file'} "${name}"?`)) return;
    try {
      const targetPath = currentPath.endsWith('/') ? `${currentPath}${name}` : `${currentPath}/${name}`;
      await apiClient.post('/admin/fs/delete', { targetPath });
      toast.success('Deleted successfully');
      fetchFiles(currentPath);
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleDownload = (name: string) => {
    const targetPath = currentPath.endsWith('/') ? `${currentPath}${name}` : `${currentPath}/${name}`;
    const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/admin/fs/download?path=${encodeURIComponent(targetPath)}`;
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    // Set headers or authentication if required. If standard token auth is used,
    // window.open or <a> tag downloads won't send Authorization headers easily.
    // However, for this admin UI, we can fetch the file as a blob and download it.
    
    toast.loading('Starting download...', { id: 'download' });
    
    apiClient.get(`/admin/fs/download?path=${encodeURIComponent(targetPath)}`, {
      responseType: 'blob'
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      // Get filename from Content-Disposition header if available
      const disposition = response.headers['content-disposition'];
      let filename = name;
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download complete', { id: 'download' });
    }).catch((error) => {
      console.error('Download error:', error);
      toast.error('Failed to download', { id: 'download' });
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('files', selectedFiles[i]);
    }

    setUploading(true);
    const toastId = toast.loading('Uploading...');
    try {
      await apiClient.post(`/admin/fs/upload?path=${encodeURIComponent(currentPath)}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Upload complete', { id: toastId });
      fetchFiles(currentPath);
    } catch (err) {
      toast.error('Failed to upload files', { id: toastId });
    } finally {
      setUploading(false);
      // Reset input
      if (e.target) e.target.value = '';
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full bg-surface border-border">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4 w-full overflow-hidden">
        <div className="w-full sm:w-auto overflow-hidden">
          <CardTitle>File Manager</CardTitle>
          <p className="text-sm text-muted mt-1 font-mono bg-background px-2 py-1 rounded inline-block max-w-full truncate">{currentPath}</p>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto">
          <input 
            type="file" 
            multiple 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleUpload} 
          />
          <input 
            type="file" 
            {...{ webkitdirectory: "", directory: "" } as any}
            className="hidden" 
            ref={folderInputRef} 
            onChange={handleUpload} 
          />
          <Button variant="primary" size="sm" onClick={() => fetchFiles(currentPath)} title="Refresh">
            <RefreshCw size={18} />
          </Button>
          <Button variant="primary" onClick={() => fileInputRef.current?.click()} className="gap-2" disabled={uploading}>
            <Upload size={18} /> Upload Files
          </Button>
          <Button variant="primary" onClick={() => folderInputRef.current?.click()} className="gap-2" disabled={uploading}>
            <UploadCloud size={18} /> Upload Folder
          </Button>
          <Button variant="primary" onClick={handleCreateFolder} className="gap-2">
            <FolderPlus size={18} /> New Folder
          </Button>
          <Button variant="primary" onClick={handleCreateFile} className="gap-2">
            <FilePlus size={18} /> New File
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border border-border rounded-lg overflow-x-auto bg-background w-full">
          <div className="min-w-full w-full">
            <div className="flex items-center gap-4 p-3 bg-surface border-b border-border text-sm font-medium text-muted">
            <div className="w-8"></div>
            <div className="flex-1">Name</div>
            <div className="w-32 text-right hidden sm:block">Size</div>
            <div className="w-40 text-right hidden sm:block">Modified</div>
            <div className="w-24"></div>
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto">
            {currentPath !== '/' && (
              <div 
                className="flex items-center gap-4 p-3 border-b border-border hover:bg-surface/50 cursor-pointer transition-colors"
                onClick={handleGoUp}
              >
                <div className="w-8 text-muted"><ArrowLeft size={20} /></div>
                <div className="flex-1 font-medium">.. (Go Up)</div>
                <div className="w-32 text-right text-muted hidden sm:block">-</div>
                <div className="w-40 text-right text-muted hidden sm:block">-</div>
                <div className="w-24"></div>
              </div>
            )}
            
            {loading ? (
              <div className="p-8 flex justify-center text-muted">
                <Loader2 className="animate-spin size-8" />
              </div>
            ) : files.length === 0 ? (
              <div className="p-8 text-center text-muted">Folder is empty</div>
            ) : (
              files.map((file, i) => (
                <div key={i} className="flex items-center gap-4 p-3 border-b border-border hover:bg-surface/50 transition-colors group">
                  <div className="w-8 text-muted">
                    {file.isDirectory ? <Folder className="text-blue-400" size={20} /> : <FileText size={20} />}
                  </div>
                  <div 
                    className={`flex-1 font-medium ${file.isDirectory ? 'cursor-pointer hover:text-primary' : ''}`}
                    onClick={() => file.isDirectory && handleNavigate(file.name)}
                  >
                    {file.name}
                  </div>
                  <div className="w-32 text-right text-sm text-muted hidden sm:block">
                    {file.isDirectory ? '-' : formatSize(file.size)}
                  </div>
                  <div className="w-40 text-right text-sm text-muted hidden sm:block">
                    {new Date(file.mtime).toLocaleDateString()}
                  </div>
                  <div className="w-24 text-right flex justify-end gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDownload(file.name); }}
                      className="text-muted hover:text-blue-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      title="Download"
                    >
                      <Download size={18} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(file.name, file.isDirectory); }}
                      className="text-muted hover:text-red-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
