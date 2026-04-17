document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.btn');
    const photoItems = document.querySelectorAll('.photo-item');
    const modal = document.getElementById('photoModal');
    const modalImg = document.getElementById('imgFull');
    const downloadBtn = document.getElementById('downloadBtn');
    const closeBtn = document.querySelector('.close-modal');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const menuToggle = document.getElementById('menuToggle');
    const menuContainer = document.getElementById('menuContainer');
    const audio = document.getElementById('bgMusic');

    // --- LOGIKA POSISI REFRESH (TAMBAHAN) ---
    // Pulihkan filter yang terakhir dipilih
    const savedFilter = localStorage.getItem('selectedFilter') || 'all';
    const savedScrollPos = localStorage.getItem('scrollPosition') || 0;

    // Fungsi untuk menerapkan filter
    const applyFilter = (filterValue) => {
        photoItems.forEach(item => {
            const isMatch = filterValue === 'all' || item.classList.contains(filterValue);
            item.style.display = isMatch ? 'contents' : 'none';
        });
        
        filterBtns.forEach(btn => {
            if (btn.getAttribute('data-filter') === filterValue) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    };

    // Terapkan filter saat load
    applyFilter(savedFilter);

    // Pulihkan posisi scroll setelah elemen dirender
    window.scrollTo(0, parseInt(savedScrollPos));

    // Simpan posisi scroll saat user berhenti scroll
    window.addEventListener('scroll', () => {
        localStorage.setItem('scrollPosition', window.scrollY);
        closeMenu(); // Fungsi bawaan Anda
    });

    // Buat elemen video modal secara dinamis
    let modalVideo = document.getElementById('videoFull');
    if (!modalVideo) {
        modalVideo = document.createElement('video');
        modalVideo.id = 'videoFull';
        modalVideo.controls = true;
        modalVideo.style.maxWidth = '100%';
        modalVideo.style.maxHeight = '80vh';
        modalVideo.style.display = 'none';
        modalVideo.style.border = '4px solid #ffffff';
        modalVideo.style.borderRadius = '8px';
        modalImg.parentNode.insertBefore(modalVideo, modalImg);
    }

    let currentMedia = [];
    let currentIndex = 0;

    // --- LOGIKA MUSIK ---
    const playMusic = () => { 
        if (audio && audio.paused) {
            audio.play().catch(() => {});
        }
    };
    window.addEventListener('click', playMusic, { once: true });

    // --- FUNGSI TUTUP MENU ---
    const closeMenu = () => {
        if (menuContainer) {
            menuContainer.style.display = 'none';
        }
    };

    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !menuContainer.contains(e.target)) {
            closeMenu();
        }
    });

    // --- TAMPIL FULL / DOWNLOAD (TAB BARU) ---
    const prepareViewFull = (src) => {
        downloadBtn.href = src;
        downloadBtn.target = "_blank";
        downloadBtn.rel = "noopener noreferrer";
        downloadBtn.removeAttribute('download'); 
    };

    // --- FILTER LOGIC ---
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const filterValue = btn.getAttribute('data-filter');
            
            // Simpan pilihan ke localStorage
            localStorage.setItem('selectedFilter', filterValue);
            
            applyFilter(filterValue);
            closeMenu();
        });
    });

    // --- MODAL UPDATE ---
    const updateModal = (index) => {
        if (currentMedia.length === 0) return;
        
        if (index < 0) {
            currentIndex = currentMedia.length - 1;
        } else if (index >= currentMedia.length) {
            currentIndex = 0;
        } else {
            currentIndex = index;
        }
        
        const media = currentMedia[currentIndex];
        const isVideo = media.tagName.toLowerCase() === 'video';

        if (isVideo) {
            modalImg.style.display = 'none';
            modalVideo.style.display = 'block';
            const videoSrc = media.querySelector('source') ? media.querySelector('source').src : media.src;
            modalVideo.src = videoSrc;
            prepareViewFull(videoSrc);
        } else {
            modalVideo.style.display = 'none';
            modalVideo.pause();
            modalImg.style.display = 'block';
            modalImg.src = media.src;
            prepareViewFull(media.src);
        }
        
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';
    };

    // --- BUKA MODAL ---
    document.getElementById('gallery-grid').onclick = (e) => {
        const card = e.target.closest('.card');
        if (card) {
            closeMenu();
            
            const visibleItems = Array.from(photoItems).filter(item => item.style.display !== 'none');
            
            currentMedia = [];
            visibleItems.forEach(item => {
                const contents = item.querySelectorAll('img, video');
                contents.forEach(content => currentMedia.push(content));
            });

            const clickedMedia = card.querySelector('img, video');
            currentIndex = currentMedia.findIndex(m => {
                const s1 = m.querySelector('source') ? m.querySelector('source').src : m.src;
                const s2 = clickedMedia.querySelector('source') ? clickedMedia.querySelector('source').src : clickedMedia.src;
                return s1 === s2;
            });
            
            if (currentIndex !== -1) {
                modal.style.display = 'flex';
                updateModal(currentIndex); 
                document.body.style.overflow = 'hidden';
            }
        }
    };

    // --- NAVIGASI ---
    nextBtn.onclick = (e) => { e.stopPropagation(); updateModal(currentIndex + 1); };
    prevBtn.onclick = (e) => { e.stopPropagation(); updateModal(currentIndex - 1); };

    // --- TUTUP MODAL ---
    const closeModalAction = () => {
        modal.style.display = 'none'; 
        modalVideo.pause();
        modalVideo.src = ""; 
        document.body.style.overflow = 'auto';
    };

    closeBtn.onclick = closeModalAction;
    modal.onclick = (e) => { if (e.target === modal) closeModalAction(); };

    // --- MENU TOGGLE & PLAY MUSIC ---
    menuToggle.onclick = (e) => {
        e.stopPropagation();
        if (audio && audio.paused) {
            audio.play().catch(() => {});
        }
        const isFlex = menuContainer.style.display === 'flex';
        menuContainer.style.display = isFlex ? 'none' : 'flex';
    };
});