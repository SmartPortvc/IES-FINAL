import React, { useState, useEffect } from 'react';
import { Download, Eye, File, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/layout/DashboardLayout';
import { fetchPorts, fetchFiles } from '../services/api';
import { Port, UploadedFile } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';

const HODFileView: React.FC = () => {
  const [ports, setPorts] = useState<Port[]>([]);
  const [selectedPortId, setSelectedPortId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);

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
    <DashboardLayout 
      title="View Files" 
      subtitle="View and download files by Port, Year, and Month (Read-only access)"
    >
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

        {/* Read-only Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-amber-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-800">Read-Only Access</h3>
              <p className="mt-1 text-sm text-amber-700">
                You have view and download access only. You cannot upload, edit, or delete files.
              </p>
            </div>
          </div>
        </div>

        {/* Files List */}
        {selectedPortId && (
          <Card 
            title={`Files - ${months[selectedMonth - 1]} ${selectedYear}`}
            icon={<File className="h-6 w-6 text-seagreen-600" />}
          >
            {loading ? (
              <LoadingSpinner message="Loading files..." />
            ) : files.length === 0 ? (
              <div className="text-center py-12">
                <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No files available for this period</p>
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
                        
                        {file.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {file.description}
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
                  Please select a port, year, and month to view files.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HODFileView;

