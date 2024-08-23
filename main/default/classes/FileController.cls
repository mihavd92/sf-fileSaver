public with sharing class FileController {
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getAllFiles() {
        List<Map<String, Object>> filesList = new List<Map<String, Object>>();
        
        // Отримання всіх версій файлів
        List<ContentVersion> allFiles = [SELECT ContentDocumentId, FileExtension, Title, ContentSize FROM ContentVersion];
        
        // Додавання даних файлів до списку
        for (ContentVersion file : allFiles) {
            Map<String, Object> fileInfo = new Map<String, Object>();
            fileInfo.put('ContentDocumentId', file.ContentDocumentId);
            fileInfo.put('Title', file.Title);
            fileInfo.put('ContentSize', file.ContentSize);
            filesList.add(fileInfo);
            fileInfo.put('FileExtension', file.FileExtension);
        }
        
        return filesList;
    }
}
