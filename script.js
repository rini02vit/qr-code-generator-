/**
 * QuickQR - Smart QR Code Generator
 * Core Frontend Logic (Vanilla JS)
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const qrInput = document.getElementById('qrInput');
    const charCount = document.getElementById('charCount');
    const copyInputBtn = document.getElementById('copyInputBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    const fgColor = document.getElementById('fgColor');
    const bgColor = document.getElementById('bgColor');
    const fgColorText = document.getElementById('fgColorText');
    const bgColorText = document.getElementById('bgColorText');
    
    const qrSize = document.getElementById('qrSize');
    const qrEcc = document.getElementById('qrEcc');
    
    const qrCanvas = document.getElementById('qrCanvas');
    const qrDisplayBox = document.getElementById('qrDisplayBox');
    const previewPlaceholder = document.getElementById('previewPlaceholder');
    const downloadBtn = document.getElementById('downloadBtn');
    
    const themeToggle = document.getElementById('themeToggle');
    const historyGrid = document.getElementById('historyGrid');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const historyEmptyState = document.getElementById('historyEmptyState');
    const toastContainer = document.getElementById('toastContainer');
    // --- State Variables ---
    let qrDebounceTimeout = null;
    let historySaveTimeout = null;
    const maxHistoryItems = 5;
    // --- Initialize Lucide Icons ---
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    // --- Toast Notification System ---
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconName = 'check-circle';
        if (type === 'info') iconName = 'info';
        if (type === 'error') iconName = 'alert-triangle';
        
        toast.innerHTML = `
            <i data-lucide="${iconName}"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons({ attrs: { class: 'toast-icon' } });
        }
        
        // Remove toast from DOM after animations finish (approx 3.8s total)
        setTimeout(() => {
            toast.remove();
        }, 3800);
    }
    // --- Theme Management ---
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        
        if (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    }
    themeToggle.addEventListener('click', () => {
        const isLightTheme = document.body.classList.toggle('light-theme');
        localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
        showToast(`Switched to ${isLightTheme ? 'Light' : 'Dark'} mode`, 'info');
    });
    // --- QR Generation Logic ---
    function generateQR() {
        const text = qrInput.value.trim();
        
        if (!text) {
            // Empty state
            qrDisplayBox.classList.remove('active');
            downloadBtn.disabled = true;
            downloadBtn.classList.add('disabled');
            return;
        }
        const options = {
            width: parseInt(qrSize.value, 10),
            margin: 1,
            color: {
                dark: fgColor.value,
                light: bgColor.value
            },
            errorCorrectionLevel: qrEcc.value
        };
        if (typeof QRCode !== 'undefined') {
            QRCode.toCanvas(qrCanvas, text, options, (error) => {
                if (error) {
                    console.error('QR Code Generation Error:', error);
                    showToast('Failed to generate QR Code. Adjust colors or text.', 'error');
                } else {
                    // Activate live preview container
                    qrDisplayBox.classList.add('active');
                    downloadBtn.disabled = false;
                    downloadBtn.classList.remove('disabled');
                    
                    // Queue auto-save to history
                    scheduleHistorySave(text, options);
                }
            });
        } else {
            console.error('QRCode Library not loaded.');
            showToast('QR Code library error. Check connection.', 'error');
        }
    }
    // Debounce QR code generation to prevent excessive rendering during typing
    function debouncedGenerateQR() {
        clearTimeout(qrDebounceTimeout);
        qrDebounceTimeout = setTimeout(generateQR, 200);
    }
    // --- Color Picker Text Sync ---
    fgColor.addEventListener('input', () => {
        fgColorText.textContent = fgColor.value;
        debouncedGenerateQR();
    });
    bgColor.addEventListener('input', () => {
        bgColorText.textContent = bgColor.value;
        debouncedGenerateQR();
    });
    // --- Dropdowns and Input Triggers ---
    qrSize.addEventListener('change', generateQR);
    qrEcc.addEventListener('change', generateQR);
    qrInput.addEventListener('input', () => {
        const length = qrInput.value.length;
        charCount.textContent = `${length} / 1000`;
        debouncedGenerateQR();
    });
    // --- Copy Input ---
    copyInputBtn.addEventListener('click', () => {
        const text = qrInput.value.trim();
        if (!text) {
            showToast('No input content to copy!', 'error');
            return;
        }
        
        navigator.clipboard.writeText(text)
            .then(() => {
                showToast('Input text copied to clipboard!', 'success');
            })
            .catch(err => {
                console.error('Copy error:', err);
                showToast('Failed to copy text', 'error');
            });
    });
    // --- Reset Form ---
    resetBtn.addEventListener('click', () => {
        qrInput.value = '';
        charCount.textContent = '0 / 1000';
        
        fgColor.value = '#000000';
        bgColor.value = '#FFFFFF';
        fgColorText.textContent = '#000000';
        bgColorText.textContent = '#FFFFFF';
        
        qrSize.value = '256';
        qrEcc.value = 'M';
        
        qrDisplayBox.classList.remove('active');
        downloadBtn.disabled = true;
        downloadBtn.classList.add('disabled');
        
        showToast('Configuration and input reset', 'info');
    });
    // --- Download PNG ---
    downloadBtn.addEventListener('click', () => {
        if (downloadBtn.disabled) return;
        
        try {
            // Get base64 PNG data from canvas
            const dataUrl = qrCanvas.toDataURL('image/png');
            
            // Create temporary download element
            const link = document.createElement('a');
            link.download = 'quickqr-code.png';
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showToast('QR Code PNG downloaded!', 'success');
        } catch (e) {
            console.error('Download error:', e);
            showToast('Could not download image. Try copying it instead.', 'error');
        }
    });
    // --- Local Storage History Management ---
    function getHistory() {
        const rawHistory = localStorage.getItem('qr_history');
        return rawHistory ? JSON.parse(rawHistory) : [];
    }
    function saveHistory(historyList) {
        localStorage.setItem('qr_history', JSON.stringify(historyList));
    }
    function scheduleHistorySave(text, options) {
        clearTimeout(historySaveTimeout);
        
        // Wait 1.5s after generation to save, ensuring the user is done modifying
        historySaveTimeout = setTimeout(() => {
            const history = getHistory();
            
            // Don't save if duplicate of the most recent item
            if (history.length > 0 && history[0].text === text && 
                history[0].fgColor === options.color.dark && 
                history[0].bgColor === options.color.light) {
                return;
            }
            // Create a small base64 thumbnail of the current canvas state
            const thumbnail = qrCanvas.toDataURL('image/png');
            
            const newItem = {
                id: Date.now(),
                text: text,
                fgColor: options.color.dark,
                bgColor: options.color.light,
                size: options.width,
                ecc: options.errorCorrectionLevel,
                thumbnail: thumbnail,
                date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString(undefined, {month: 'short', day: 'numeric'})
            };
            // Prepend new item and slice to maximum
            history.unshift(newItem);
            if (history.length > maxHistoryItems) {
                history.pop();
            }
            saveHistory(history);
            renderHistory();
            showToast('QR code saved to history', 'info');
        }, 1500);
    }
    function deleteHistoryItem(id, event) {
        // Prevent trigger parent click handler
        event.stopPropagation();
        
        let history = getHistory();
        history = history.filter(item => item.id !== id);
        saveHistory(history);
        renderHistory();
        showToast('History item deleted', 'info');
    }
    function loadHistoryItem(item) {
        qrInput.value = item.text;
        charCount.textContent = `${item.text.length} / 1000`;
        
        fgColor.value = item.fgColor;
        fgColorText.textContent = item.fgColor;
        
        bgColor.value = item.bgColor;
        bgColorText.textContent = item.bgColor;
        
        qrSize.value = item.size;
        qrEcc.value = item.ecc;
        
        generateQR();
        showToast('Restored QR Code configuration', 'success');
    }
    function renderHistory() {
        const history = getHistory();
        
        // Clear all previous visual items except the empty state
        const items = historyGrid.querySelectorAll('.history-item');
        items.forEach(item => item.remove());
        if (history.length === 0) {
            historyEmptyState.style.display = 'flex';
            clearHistoryBtn.style.display = 'none';
            return;
        }
        historyEmptyState.style.display = 'none';
        clearHistoryBtn.style.display = 'inline-flex';
        history.forEach(item => {
            const historyItemDiv = document.createElement('div');
            historyItemDiv.className = 'history-item';
            
            historyItemDiv.innerHTML = `
                <button class="btn-delete-item" title="Delete this item">
                    <i data-lucide="x"></i>
                </button>
                <div class="history-qr-thumb">
                    <img src="${item.thumbnail}" alt="QR code thumbnail">
                </div>
                <div class="history-details">
                    <div class="history-text">${escapeHtml(item.text)}</div>
                    <div class="history-date">${item.date}</div>
                </div>
            `;
            // Click listener for reloading the history item configurations
            historyItemDiv.addEventListener('click', () => loadHistoryItem(item));
            
            // Delete listener
            const deleteBtn = historyItemDiv.querySelector('.btn-delete-item');
            deleteBtn.addEventListener('click', (e) => deleteHistoryItem(item.id, e));
            historyGrid.appendChild(historyItemDiv);
        });
        // Initialize Lucide icons on newly created nodes
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your QR code history?')) {
            saveHistory([]);
            renderHistory();
            showToast('All history cleared', 'info');
        }
    });
    // Helper function to escape HTML characters and prevent XSS injection
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
    // --- Startup Execution ---
    initTheme();
    renderHistory();
});
