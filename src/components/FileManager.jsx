import { useEffect, useState } from 'react';
import { S3Service } from '../services/s3Service';

const FileManager = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    // ファイル一覧を取得
    useEffect(() => {
        loadFiles();
    }, []);

    const loadFiles = async () => {
        try {
            const fileList = await S3Service.listFiles();
            setFiles(fileList || []);
        } catch (error) {
            console.error('Failed to load files:', error);
        }
    };

    // ファイル選択
    const handleFileSelect = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    // ファイルアップロード
    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            const fileName = `${Date.now()}-${selectedFile.name}`;
            await S3Service.uploadFile(selectedFile, fileName);
            alert('アップロード成功！');
            setSelectedFile(null);
            loadFiles(); // 一覧を更新
        } catch (error) {
            alert('アップロード失敗: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    // ファイル削除
    const handleDelete = async (key) => {
        if (!confirm('このファイルを削除しますか？')) return;

        try {
            await S3Service.deleteFile(key);
            alert('削除成功！');
            loadFiles(); // 一覧を更新
        } catch (error) {
            alert('削除失敗: ' + error.message);
        }
    };

    // ファイルダウンロード
    const handleDownload = (key) => {
        const url = S3Service.getSignedUrl(key);
        window.open(url, '_blank');
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>S3 ファイル管理</h2>

            {/* ファイルアップロード */}
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd' }}>
                <h3>ファイルアップロード</h3>
                <input
                    type="file"
                    onChange={handleFileSelect}
                    disabled={uploading}
                />
                <button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    style={{ marginLeft: '10px' }}
                >
                    {uploading ? 'アップロード中...' : 'アップロード'}
                </button>
            </div>

            {/* ファイル一覧 */}
            <div>
                <h3>ファイル一覧</h3>
                {files.length === 0 ? (
                    <p>ファイルがありません</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f5f5f5' }}>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>ファイル名</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>サイズ</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>更新日時</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map((file) => (
                                <tr key={file.Key}>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{file.Key}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{Math.round(file.Size / 1024)} KB</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(file.LastModified).toLocaleString()}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                        <button
                                            onClick={() => handleDownload(file.Key)}
                                            style={{ marginRight: '5px' }}
                                        >
                                            ダウンロード
                                        </button>
                                        <button
                                            onClick={() => handleDelete(file.Key)}
                                            style={{ backgroundColor: '#ff4444', color: 'white' }}
                                        >
                                            削除
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default FileManager;