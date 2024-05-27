function validateFileType(input) {
    const allowedExtensions = /(\.pdf)$/i;
    if (!allowedExtensions.exec(input.value)) {
        alert('Please select a PDF file');
        input.value = '';
        return false;
    }
    return true;
}