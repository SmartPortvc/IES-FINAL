import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, Eye, Trash2, Edit2, File, Calendar, AlertCircle, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/layout/DashboardLayout';
import { fetchPorts } from '../services/api';
import { uploadFile, fetchFiles, deleteFile, updateFileDescription } from '../services/api';
import { Port, UploadedFile } from '../types';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';

const AdminFileUpload: React.FC = () => {
  const { currentUser } = useAuth();
  const [ports, setPorts] = useState<Port[]>([]);
  const [selectedPortId, setSelectedPortId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    loadPorts();
  }, []);

  useEffect(() => {
    if (selectedPortId && selectedYear && selectedMonth) {
      loadFiles();
    } else {
      setFiles([]);
    }
  }, [selectedPortId, selectedYear, selectedMonth]);

  const loadPorts = async () => {
    try {
      setLoading(true);
      const portsData = await fetchPorts();
      setPorts(portsData);
    } catch (error) {
      console.error('Error loading ports:', error);
      toast.error('Failed to load ports');
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async () => {
    if (!selectedPortId) return;
    try {
      setLoading(true);
      const filesData = await fetchFiles(selectedPortId, selectedYear, selectedMonth);
      setFiles(filesData);
    } catch (error) {
      console.error('Error loading files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFileInput(file);
  };

  const handleUpload = async () => {
    if (!selectedPortId) {
      toast.error('Please select a port');
      return;
    }

    if (!fileInput) {
      toast.error('Please select a file');
      return;
    }

    if (!currentUser) {
      toast.error('User not authenticated');
      return;
    }

    try {
      setUploading(true);
      await uploadFile(
        selectedPortId,
        selectedYear,
        selectedMonth,
        fileInput,
        description,
        currentUser.uid
      );
      toast.success('File uploaded successfully');
      setFileInput(null);
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await loadFiles();
    } catch (error: any) {
      console.error('Error uploading file:', error);
      const errorMessage = error?.message || 'Failed to upload file';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (file: UploadedFile) => {
    if (!selectedPortId) return;
    
    if (!window.confirm(`Are you sure you want to delete "${file.originalFileName}"?`)) {
      return;
    }

    try {
      await deleteFile(selectedPortId, selectedYear, selectedMonth, file.id, file.url, file.storagePath);
      toast.success('File deleted successfully');
      await loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleEditStart = (file: UploadedFile) => {
    setEditingFileId(file.id);
    setEditDescription(file.description || '');
  };

  const handleEditCancel = () => {
    setEditingFileId(null);
    setEditDescription('');
  };

  const handleEditSave = async (fileId: string) => {
    if (!selectedPortId) return;

    try {
      await updateFileDescription(selectedPortId, selectedYear, selectedMonth, fileId, editDescription);
      toast.success('File description updated successfully');
      setEditingFileId(null);
      setEditDescription('');
      await loadFiles();
    } catch (error) {
      console.error('Error updating file description:', error);
      toast.error('Failed to update file description');
    }
  };

  const handleDownload = (file: UploadedFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.originalFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <DashboardLayout title="Upload Files" subtitle="Manage files by Port, Year, and Month">
      <div className="space-y-6">
        {/* Selection Section */}
        <Card title="Select Port, Year & Month" icon={<Calendar className="h-6 w-6 text-seagreen-600" />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Port
              </label>
              <select
                value={selectedPortId}
                onChange={(e) => setSelectedPortId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-seagreen-500 focus:border-seagreen-500"
              >
                <option value="">Select Port</option>
                {ports.map((port) => (
                  <option key={port.id} value={port.id}>
                    {port.portName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-seagreen-500 focus:border-seagreen-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-seagreen-500 focus:border-seagreen-500"
              >
                {months.map((month, index) => (
                  <option key={index + 1} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Upload Section */}
        {selectedPortId && (
          <Card title="Upload New File" icon={<Upload className="h-6 w-6 text-seagreen-600" />}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  File Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-seagreen-500 focus:border-seagreen-500"
                  placeholder="Enter file description (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-seagreen-500 focus:border-seagreen-500"
                />
                {fileInput && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {fileInput.name} ({formatFileSize(fileInput.size)})
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Max file size: 10MB
                </p>
              </div>

              <Button
                onClick={handleUpload}
                disabled={!fileInput || uploading}
                loading={uploading}
                icon={<Upload className="h-4 w-4" />}
              >
                {uploading ? 'Uploading...' : 'Upload File'}
              </Button>
            </div>
          </Card>
        )}

        {/* Files List */}
        {selectedPortId && (
          <Card 
            title={`Uploaded Files - ${months[selectedMonth - 1]} ${selectedYear}`}
            icon={<File className="h-6 w-6 text-seagreen-600" />}
          >
            {loading ? (
              <LoadingSpinner message="Loading files..." />
            ) : files.length === 0 ? (
              <div className="text-center py-12">
                <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No files uploaded for this period</p>
              </div>
            ) : (
              <div className="space-y-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <File className="h-5 w-5 text-seagreen-600 flex-shrink-0" />
                          <h4 className="font-semibold text-gray-900 truncate">
                            {file.originalFileName}
                          </h4>
                        </div>
                        
                        {editingFileId === file.id ? (
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="text"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-seagreen-500 focus:border-seagreen-500"
                              placeholder="Enter description"
                            />
                            <button
                              onClick={() => handleEditSave(file.id)}
                              className="p-1.5 text-seagreen-600 hover:bg-seagreen-50 rounded"
                              title="Save"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="p-1.5 text-gray-600 hover:bg-gray-50 rounded"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600 mb-2">
                            {file.description || 'No description'}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{formatFileSize(file.fileSize)}</span>
                          <span>•</span>
                          <span>Uploaded {formatDate(file.uploadedAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-seagreen-600 hover:bg-seagreen-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="h-5 w-5" />
                        </a>
                        <button
                          onClick={() => handleDownload(file)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        {editingFileId !== file.id && (
                          <button
                            onClick={() => handleEditStart(file)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(file)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {!selectedPortId && (
          <div className="bg-seagreen-50 border border-seagreen-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-6 w-6 text-seagreen-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-seagreen-800">Select Port, Year & Month</h3>
                <p className="mt-1 text-sm text-seagreen-700">
                  Please select a port, year, and month to upload and manage files.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminFileUpload;

