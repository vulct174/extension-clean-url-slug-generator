document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const inputString = document.getElementById('inputString');
  const dashSeparator = document.getElementById('dashSeparator');
  const underscoreSeparator = document.getElementById('underscoreSeparator');
  const removeStopWords = document.getElementById('removeStopWords');
  const removeNumbers = document.getElementById('removeNumbers');
  const outputSlug = document.getElementById('outputSlug');
  const slugifyBtn = document.getElementById('slugifyBtn');
  const clearBtn = document.getElementById('clearBtn');
  const resetBtn = document.getElementById('resetBtn');
  const copyBtn = document.getElementById('copyBtn');
  const infoToggle = document.querySelector('.info-toggle');
  const infoContent = document.querySelector('.info-content');
  const toggleIcon = document.querySelector('.toggle-icon');

  // Common English stop words
  const stopWords = [
    'a', 'an', 'the', 'and', 'or', 'but', 'because', 'as', 'at', 'by', 'for',
    'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off',
    'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
    'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most',
    'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now', 'is', 'are',
    'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do',
    'does', 'did', 'doing', 'would', 'could', 'should', 'shall', 'may', 'might',
    'must', 'of', 'that', 'this', 'these', 'those', 'am', 'i', 'we', 'our', 'ours',
    'you', 'your', 'yours', 'he', 'him', 'his', 'she', 'her', 'hers', 'it', 'its',
    'they', 'them', 'their', 'theirs', 'what', 'which', 'who', 'whom', 'whose'
  ];

  // Load saved preferences
  chrome.storage.local.get(['options'], function(result) {
    if (result.options) {
      if (result.options.separator === 'underscore') {
        underscoreSeparator.checked = true;
      }
      removeStopWords.checked = result.options.removeStopWords || false;
      removeNumbers.checked = result.options.removeNumbers || false;
    }
  });

  // Generate slug function
  function generateSlug() {
    let text = inputString.value.trim();
    
    if (!text) {
      outputSlug.value = '';
      return;
    }
    
    // Convert to lowercase
    text = text.toLowerCase();
    
    // Replace special characters and symbols
    text = text.replace(/&/g, ' and ');
    text = text.replace(/[€]/g, ' euro ');
    text = text.replace(/[$]/g, ' dollar ');
    text = text.replace(/[£]/g, ' pound ');
    text = text.replace(/[¥]/g, ' yen ');
    
    // Handle numbers
    if (removeNumbers.checked) {
      text = text.replace(/[0-9]/g, '');
    }
    
    // Remove stop words if checked
    if (removeStopWords.checked) {
      let words = text.split(/\s+/);
      words = words.filter(word => !stopWords.includes(word));
      text = words.join(' ');
    }
    
    // Replace all non-alphanumeric characters with spaces
    text = text.replace(/[^a-z0-9\s]/g, ' ');
    
    // Remove multiple spaces and trim
    text = text.replace(/\s+/g, ' ').trim();
    
    // Replace spaces with separator
    const separator = underscoreSeparator.checked ? '_' : '-';
    text = text.replace(/\s/g, separator);
    
    // Remove repeated separators
    text = text.replace(new RegExp(`[${separator}]+`, 'g'), separator);
    
    // Trim separators from start and end
    text = text.replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');
    
    outputSlug.value = text;
    
    // Save preferences
    chrome.storage.local.set({
      options: {
        separator: underscoreSeparator.checked ? 'underscore' : 'dash',
        removeStopWords: removeStopWords.checked,
        removeNumbers: removeNumbers.checked
      }
    });
  }

  // Event listeners
  slugifyBtn.addEventListener('click', generateSlug);
  
  // Auto-generate on input change
  inputString.addEventListener('input', debounce(generateSlug, 500));
  
  dashSeparator.addEventListener('change', generateSlug);
  underscoreSeparator.addEventListener('change', generateSlug);
  removeStopWords.addEventListener('change', generateSlug);
  removeNumbers.addEventListener('change', generateSlug);
  
  clearBtn.addEventListener('click', function() {
    inputString.value = '';
    outputSlug.value = '';
    inputString.focus();
  });
  
  resetBtn.addEventListener('click', function() {
    dashSeparator.checked = true;
    removeStopWords.checked = false;
    removeNumbers.checked = false;
    inputString.value = '';
    outputSlug.value = '';
    inputString.focus();
    
    // Reset saved preferences
    chrome.storage.local.set({
      options: {
        separator: 'dash',
        removeStopWords: false,
        removeNumbers: false
      }
    });
  });
  
  copyBtn.addEventListener('click', function() {
    if (!outputSlug.value) return;
    
    navigator.clipboard.writeText(outputSlug.value).then(function() {
      copyBtn.innerHTML = '<i class="fas fa-check"></i>';
      copyBtn.classList.add('copy-success');
      
      setTimeout(function() {
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.classList.remove('copy-success');
      }, 1500);
    });
  });
  
  infoToggle.addEventListener('click', function() {
    infoContent.classList.toggle('hidden');
    toggleIcon.style.transform = infoContent.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
  });
  
  // Helper functions
  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    };
  }
}); 