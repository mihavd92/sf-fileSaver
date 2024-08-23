import { LightningElement, wire, track } from 'lwc';
import getAllFiles from '@salesforce/apex/FileController.getAllFiles';
import { NavigationMixin } from 'lightning/navigation';

export default class FileSaver extends NavigationMixin(LightningElement) {

    @track filesList = [];
    @track filteredFilesList = [];
    @track paginatedFilesList = [];
    searchTerm = '';
    pageSize = 3;
    currentPage = 1;
    totalPages = 1;
    hoveredFileId = null; // To track which file is being hovered over

    pageSizeOptions = [
        { label: '3', value: 3 },
        { label: '5', value: 5 },
        { label: '10', value: 10 }
    ];

    @wire(getAllFiles)
    wiredResult({ data, error }) {
        if (data) {
            this.filesList = data.map(file => ({
                "label": file.Title,
                "value": file.ContentDocumentId,
                "size": this.formatFileSize(file.ContentSize),
                "url": `/sfc/servlet.shepherd/document/download/${file.ContentDocumentId}`,
                "extension": file.FileExtension // Додано розширення файлу
            }));
            this.filteredFilesList = this.filesList;
            this.updatePagination();
        }
        if (error) {
            console.error(error);
        }
    }

    formatFileSize(size) {
        if (size < 1024) {
            return `${size} bytes`;
        } else if (size < 1048576) { // 1024 * 1024
            return `${(size / 1024).toFixed(2)} KB`;
        } else if (size < 1073741824) { // 1024 * 1024 * 1024
            return `${(size / 1048576).toFixed(2)} MB`;
        } else {
            return `${(size / 1073741824).toFixed(2)} GB`;
        }
    }

    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        let filteredFiles = [];
    
        // Перевірка, чи починається пошук з крапки
        if (searchTerm.startsWith(".")) {
            // Видаляємо крапку з пошукового терміну
            const searchTermWithoutDot = searchTerm.substring(1);
            // Шукаємо збіги у FileExtension
            filteredFiles = this.filesList.filter(file => 
                file.extension.toLowerCase() === searchTermWithoutDot
            );
        } else {
            // Пошук за назвою
            filteredFiles = this.filesList.filter(file => 
                file.label.toLowerCase().includes(searchTerm)
            );
        }
    
        this.filteredFilesList = filteredFiles;
        this.currentPage = 1;
        this.updatePagination();
    }
    


    handlePageSizeChange(event) {
        this.pageSize = parseInt(event.target.value, 10);
        this.currentPage = 1;
        this.updatePagination();
    }

    handleNextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updatePagination();
        }
    }

    handlePreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updatePagination();
        }
    }

    updatePagination() {
        this.totalPages = Math.ceil(this.filteredFilesList.length / this.pageSize);
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.paginatedFilesList = this.filteredFilesList.slice(startIndex, endIndex);
    }

    downloadFile(event) {
        const fileUrl = event.currentTarget.dataset.url;
        window.open(fileUrl, '_blank');
    }

    previewHandler(event) {
        this[NavigationMixin.Navigate]({
            type: 'standard__namedPage',
            attributes: {
                pageName: 'filePreview'
            },
            state: {
                selectedRecordId: event.target.dataset.id
            }
        });
    }

    handleMouseOver(event) {
        this.hoveredFileId = event.target.dataset.id;
    }

    handleMouseOut() {
        this.hoveredFileId = null;
    }

    get disablePrevious() {
        return this.currentPage <= 1;
    }

    get disableNext() {
        return this.currentPage >= this.totalPages;
    }
}
