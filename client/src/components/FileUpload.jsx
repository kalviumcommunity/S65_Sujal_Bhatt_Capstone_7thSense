import React, { useState } from 'react';

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);


        if (selectedFile && selectedFile.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setMessage('File uploaded successfully!');
            } else {
                setMessage('Failed to upload file.');
            }
        } catch (error) {
            setMessage('An error occurred while uploading the file.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '20px', color: '#333' }}>File Upload</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="file"
                    onChange={handleFileChange}
                    style={{
                        padding: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '16px',
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                    }}
                >
                    Upload
                </button>
            </form>
            {preview && (
                <div style={{ marginTop: '20px' }}>
                    <h3 style={{ fontSize: '18px', color: '#333' }}>Image Preview:</h3>
                    <img
                        src={preview}
                        alt="Preview"
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', marginTop: '10px' }}
                    />
                </div>
            )}
            {message && (
                <p style={{ marginTop: '15px', fontSize: '14px', color: message.includes('successfully') ? 'green' : 'red' }}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default FileUpload