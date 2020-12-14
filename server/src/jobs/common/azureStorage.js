const { BlobServiceClient } = require("@azure/storage-blob");

module.exports = (azureStorageConnectionString) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(azureStorageConnectionString);

  return {
    downloadBlobAsStreamBody: async (containerName, blobName) => {
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const downloadBlockBlobResponse = await blockBlobClient.download(0);
      return downloadBlockBlobResponse.readableStreamBody;
    },
    saveBlobToFile: async (containerName, blobName, filePath) => {
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      return blockBlobClient.downloadToFile(filePath);
    },
    getContainer: async (containerName) => {
      return blobServiceClient.getContainerClient(containerName);
    },
  };
};
