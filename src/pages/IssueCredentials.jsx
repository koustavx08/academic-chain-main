import React, { useState, useRef } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';
import imageCompression from 'browser-image-compression';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const PINATA_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (Pinata's limit)

// Function to generate a short ID
const generateShortId = () => {
  // Generate a random string of 8 characters
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shortId = 'CRED-';
  for (let i = 0; i < 8; i++) {
    shortId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return shortId;
};

const IssueCredentials = () => {
  const { account, contract, isInstitution } = useWeb3();
  const [formData, setFormData] = useState({
    studentAddress: '',
    certificateName: '',
    course: '',
    file: null,
    fileName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  const [ipfsError, setIpfsError] = useState(null);
  const [issuedCredentialId, setIssuedCredentialId] = useState('');
  const fileInputRef = useRef(null);

  // Initialize IPFS client
  const ipfs = create({
    url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
    headers: {
      pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
      pinata_secret_api_key: import.meta.env.VITE_PINATA_API_SECRET,
    },
  });

  // Initialize Pinata IPFS client
  React.useEffect(() => {
    const initializePinata = async () => {
      try {
        setCurrentStep('Initializing Pinata IPFS...');
        
        // Test Pinata connection
        const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
          method: 'GET',
          headers: {
            pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
            pinata_secret_api_key: import.meta.env.VITE_PINATA_API_SECRET,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to authenticate with Pinata');
        }

        setIsInitializing(false);
        setIpfsError(null);
      } catch (error) {
        console.error('Error initializing Pinata:', error);
        setIpfsError(error.message);
        setIsInitializing(false);
      }
    };

    initializePinata();
  }, []);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateFile = (file) => {
    if (!file) {
      throw new Error('Please select a file to upload');
    }

    if (!SUPPORTED_TYPES.includes(file.type)) {
      throw new Error('Unsupported file type. Please upload a PDF or image file.');
    }

    if (file.size > PINATA_MAX_FILE_SIZE) {
      throw new Error(`File size too large. Maximum size is ${PINATA_MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    return true;
  };

  const validateForm = () => {
    if (!formData.studentAddress) {
      throw new Error('Please enter a student wallet address');
    }

    if (!ethers.isAddress(formData.studentAddress)) {
      throw new Error('Invalid wallet address format');
    }

    if (!formData.certificateName) {
      throw new Error('Please enter a certificate name');
    }

    if (!formData.course) {
      throw new Error('Please enter a course name');
    }

    return true;
  };

  const compressImage = async (file) => {
    if (!file.type.startsWith('image/')) return file;

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      onProgress: (progress) => {
        setCompressionProgress(Math.round(progress));
      },
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw new Error('Failed to compress image. Please try again.');
    }
  };

  const uploadToIPFS = async (file, retry = 0) => {
    try {
      setCurrentStep('Uploading to IPFS...');
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Add metadata
      formData.append('pinataMetadata', JSON.stringify({
        name: formData.fileName,
        keyvalues: {
          certificateName: formData.certificateName,
          course: formData.course,
          uploadDate: new Date().toISOString(),
        }
      }));

      // Add pinataOptions for better control
      formData.append('pinataOptions', JSON.stringify({
        cidVersion: 1,
        wrapWithDirectory: false
      }));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
          pinata_secret_api_key: import.meta.env.VITE_PINATA_API_SECRET,
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Pinata upload failed: ${errorData.error?.details || response.statusText}`
        );
      }

      const result = await response.json();
      
      if (!result.IpfsHash) {
        throw new Error('Invalid response from Pinata: Missing IPFS hash');
      }

      return result.IpfsHash;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      
      // Handle specific Pinata errors
      if (error.name === 'AbortError') {
        throw new Error('Upload timed out. Please try again.');
      }
      
      if (error.message.includes('413')) {
        throw new Error('File size exceeds Pinata\'s limit. Please compress the file or use a smaller one.');
      }
      
      if (error.message.includes('401')) {
        throw new Error('Invalid Pinata API credentials. Please check your configuration.');
      }
      
      if (retry < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, retry); // Exponential backoff
        setError(`Upload failed. Retrying in ${delay/1000} seconds (${retry + 1}/${MAX_RETRIES})...`);
        await sleep(delay);
        return uploadToIPFS(file, retry + 1);
      }
      
      throw new Error('Failed to upload file to IPFS after multiple attempts. Please try again later.');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      validateFile(file);
      
      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl('');
      }

      setFormData((prev) => ({
        ...prev,
        file,
        fileName: file.name,
      }));
      setError('');
    } catch (err) {
      setError(err.message);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);
    setCompressionProgress(0);
    setCurrentStep('');
    setIssuedCredentialId('');

    try {
      if (ipfsError) {
        throw new Error('IPFS service is not available. Please try again later.');
      }

      // Validate form data
      validateForm();
      validateFile(formData.file);

      if (!contract || !isInstitution) {
        throw new Error('You must be an institution to issue credentials');
      }

      // Generate a short ID for the credential
      const shortId = generateShortId();
      setIssuedCredentialId(shortId);

      // Compress image if it's an image file
      setCurrentStep('Compressing image...');
      const processedFile = await compressImage(formData.file);

      // Upload file to IPFS
      const ipfsHash = await uploadToIPFS(processedFile);

      // Prepare metadata
      const metadata = JSON.stringify({
        name: formData.certificateName,
        course: formData.course,
        fileName: formData.fileName,
        fileType: formData.file.type,
        originalSize: formData.file.size,
        compressedSize: processedFile.size,
        uploadDate: new Date().toISOString(),
        ipfsHash: ipfsHash,
        shortId: shortId
      });

      // Generate certificate hash
      setCurrentStep('Generating certificate hash...');
      const certificateHash = ethers.keccak256(
        ethers.toUtf8Bytes(formData.certificateName + formData.course + shortId)
      );

      // Issue credential
      setCurrentStep('Issuing credential...');
      const tx = await contract.issueCredential(
        formData.studentAddress,
        certificateHash,
        ipfsHash,
        metadata
      );

      setCurrentStep('Waiting for transaction confirmation...');
      const receipt = await tx.wait();

      // Get the credential ID from the event
      const credentialId = receipt.logs[0].topics[1];
      
      setSuccess(`Credential issued successfully! Credential ID: ${shortId}`);
      setFormData({
        studentAddress: '',
        certificateName: '',
        course: '',
        file: null,
        fileName: '',
      });
      setPreviewUrl('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      if (err.code === 'ACTION_REJECTED') {
        setError('Transaction was rejected by user');
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        setError('Insufficient funds for transaction');
      } else if (err.message.includes('nonce')) {
        setError('Transaction failed. Please try again.');
      } else if (err.message.includes('IPFS')) {
        setError(err.message);
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
      setCompressionProgress(0);
      setCurrentStep('');
    }
  };

  // Clean up preview URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!account) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">
          Please connect your wallet to issue credentials
        </h2>
      </div>
    );
  }

  if (!isInstitution) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">
          Only registered institutions can issue credentials
        </h2>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">{currentStep}</p>
      </div>
    );
  }

  if (ipfsError) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                IPFS Service Error: {ipfsError}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Issue Credentials</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
              {issuedCredentialId && (
                <div className="mt-2 p-2 bg-white rounded border border-green-200">
                  <p className="text-sm font-medium text-gray-700">Credential ID:</p>
                  <p className="text-lg font-mono font-bold text-indigo-600">{issuedCredentialId}</p>
                  <p className="text-xs text-gray-500 mt-1">Save this ID for future reference</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="studentAddress"
            className="block text-sm font-medium text-gray-700"
          >
            Student Wallet Address
          </label>
          <input
            type="text"
            id="studentAddress"
            name="studentAddress"
            value={formData.studentAddress}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="0x..."
          />
        </div>

        <div>
          <label
            htmlFor="certificateName"
            className="block text-sm font-medium text-gray-700"
          >
            Certificate Name
          </label>
          <input
            type="text"
            id="certificateName"
            name="certificateName"
            value={formData.certificateName}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="course"
            className="block text-sm font-medium text-gray-700"
          >
            Course
          </label>
          <input
            type="text"
            id="course"
            name="course"
            value={formData.course}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-700"
          >
            Credential File (PDF or Image)
          </label>
          <div className="mt-1 flex items-center">
            <input
              ref={fileInputRef}
              type="file"
              id="file"
              name="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              required
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
          </div>
          {formData.fileName && (
            <div className="mt-2 space-y-2">
              <p className="text-sm text-gray-500">
                Selected file: {formData.fileName}
              </p>
              <p className="text-sm text-gray-500">
                Size: {(formData.file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          )}
          {previewUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
              />
            </div>
          )}
          {compressionProgress > 0 && compressionProgress < 100 && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-yellow-500 h-2.5 rounded-full"
                  style={{ width: `${compressionProgress}%` }}
                ></div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Compressing: {compressionProgress}%
              </p>
            </div>
          )}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Uploading: {uploadProgress}%
              </p>
            </div>
          )}
        </div>

        {currentStep && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">{currentStep}</p>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Processing...' : 'Issue Credential'}
        </button>
      </form>
    </div>
  );
};

export default IssueCredentials; 