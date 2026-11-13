const tabs = document.querySelectorAll('.auth-tab');
      const cards = document.querySelectorAll('.auth-card');
      const uploadInput = document.getElementById('file-input');
      const uploadCard = document.getElementById('upload-card');
      const fileList = document.getElementById('file-list');
      const submitUploadButton = document.getElementById('submit-upload');
      const uploadProgress = document.getElementById('upload-progress');
      const uploadProgressLabel = document.getElementById('upload-progress-label');
      const uploadProgressWrap = document.getElementById('upload-progress-wrap');
      const uploadSubmit = document.querySelector('.upload-submit');
      const plotLengthInput = document.getElementById('plot-length');
      const plotWidthInput = document.getElementById('plot-width');
      const listingTitleInput = document.getElementById('listing-title');
      const listingPriceInput = document.getElementById('listing-price');
      const listingFloorsInput = document.getElementById('listing-floors');
      const listingBedroomsInput = document.getElementById('listing-bedrooms');
      const listingBathroomsInput = document.getElementById('listing-bathrooms');
      const listingDescriptionInput = document.getElementById('listing-description');
      const listingImageInput = document.getElementById('listing-image');
      const listingPhotoName = document.getElementById('listing-photo-name');
      const listingPhotoPreviewWrap = document.getElementById('listing-photo-preview-wrap');
      const listingPhotoPreview = document.getElementById('listing-photo-preview');
      const listingFormFields = [listingTitleInput, listingPriceInput, listingFloorsInput, listingBedroomsInput, listingBathroomsInput, plotLengthInput, plotWidthInput, listingDescriptionInput];
      let listingPhotoObjectUrl = null;
      const accountSection = document.getElementById('account');
      const registerForm = document.querySelector('.auth-card.active form');
      const registerStatus = document.getElementById('register-status');
      const registerPasswordInput = document.getElementById('register-password');
      const registerProfileFields = {
        firstName: document.getElementById('first-name'),
        lastName: document.getElementById('last-name'),
        phone: document.getElementById('register-phone'),
        email: document.getElementById('register-email'),
        accountType: document.getElementById('account-type'),
      };
      const accountTriggers = document.querySelectorAll('.create-account-btn, .nav-account-btn');
      const menuToggle = document.querySelector('.menu-toggle');
      const navigation = document.querySelector('.nav-links');
      const pageLinks = document.querySelectorAll('.nav-links a[data-page]');
      const availablePages = ['marketplace', 'featured', 'upload', 'features', 'process', 'reviews', 'contact'];
      const requestedPage = new URLSearchParams(window.location.search).get('page');
      const currentPage = availablePages.includes(requestedPage) ? requestedPage : 'marketplace';
      const plansGrid = document.querySelector('.plans-grid');
      const purchaseDialog = document.getElementById('purchase-dialog');
      const purchasePlanName = document.getElementById('purchase-plan-name');
      const purchaseAmount = document.getElementById('purchase-amount');
      const paymentStatus = document.getElementById('payment-status');
      let selectedPlan = null;
      let savedPlanRatings = {};
      let savedUploadedPlans = [];

      try {
        const storedPlans = JSON.parse(localStorage.getItem('edp-uploaded-plans') || '[]');
        savedUploadedPlans = Array.isArray(storedPlans)
          ? storedPlans.filter((listing) => listing && typeof listing.id === 'string' && typeof listing.imageData === 'string')
          : [];
      } catch {
        savedUploadedPlans = [];
      }

      try {
        const savedProfile = JSON.parse(localStorage.getItem('edp-account-profile') || 'null');
        if (savedProfile && typeof savedProfile === 'object') {
          Object.entries(registerProfileFields).forEach(([key, field]) => {
            if (typeof savedProfile[key] === 'string') {
              field.value = savedProfile[key];
            }
          });
          registerStatus.textContent = 'Your profile is saved in this browser. Enter your password to update it.';
        }
      } catch {
        registerStatus.textContent = 'A saved profile could not be loaded from this browser.';
      }

      registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!registerProfileFields.phone.value.trim() && !registerProfileFields.email.value.trim()) {
          registerStatus.textContent = 'Enter a phone number or email address to save your profile.';
          return;
        }

        const profile = Object.fromEntries(
          Object.entries(registerProfileFields).map(([key, field]) => [key, field.value.trim()]),
        );

        try {
          localStorage.setItem('edp-account-profile', JSON.stringify(profile));
          registerPasswordInput.value = '';
          registerStatus.textContent = 'Profile saved in this browser. This demo does not create an online account.';
        } catch {
          registerStatus.textContent = 'Could not save your profile in this browser. Check your browser storage settings.';
        }
      });

      try {
        const storedRatings = JSON.parse(localStorage.getItem('edp-plan-ratings') || '{}');
        savedPlanRatings = storedRatings && typeof storedRatings === 'object' ? storedRatings : {};
      } catch {
        savedPlanRatings = {};
      }

      function initialisePlanRating(ratingControl) {
        const ratingId = ratingControl.dataset.ratingId;
        const storedRating = Number(savedPlanRatings[ratingId]) || 0;
        const initialRating = Math.max(0, Math.min(5, storedRating));
        const feedback = document.createElement('span');
        feedback.className = 'rating-feedback';
        feedback.setAttribute('aria-live', 'polite');
        feedback.textContent = initialRating ? `${initialRating}/5` : 'Rate';
        ratingControl.appendChild(feedback);

        const ratingButtons = [];
        const updateRating = (rating) => {
          ratingButtons.forEach((button, index) => {
            const isSelected = index < rating;
            button.setAttribute('aria-pressed', String(isSelected));
            button.classList.toggle('is-active', isSelected);
          });
        };

        for (let rating = 1; rating <= 5; rating += 1) {
          const button = document.createElement('button');
          button.className = 'rating-star';
          button.type = 'button';
          button.textContent = '★';
          button.setAttribute('aria-label', `Rate ${rating} out of 5 stars`);
          button.setAttribute('aria-pressed', 'false');
          button.addEventListener('click', () => {
            savedPlanRatings[ratingId] = rating;
            try {
              localStorage.setItem('edp-plan-ratings', JSON.stringify(savedPlanRatings));
            } catch {
              // Keep the selected rating for this page view if storage is unavailable.
            }
            updateRating(rating);
            feedback.textContent = `${rating}/5`;
          });
          ratingButtons.push(button);
          ratingControl.insertBefore(button, feedback);
        }

        updateRating(initialRating);
        if (initialRating) {
          feedback.textContent = `${initialRating}/5`;
        }
      }

      document.querySelectorAll('.plan-rating[data-rating-id]').forEach(initialisePlanRating);

      document.querySelectorAll('main > section[data-page-view]').forEach((section) => {
        section.hidden = !section.dataset.pageView.split(/\s+/).includes(currentPage);
      });

      pageLinks.forEach((link) => {
        const isCurrentPage = link.dataset.page === currentPage;
        link.classList.toggle('active', isCurrentPage);
        if (isCurrentPage) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });

      if (menuToggle && navigation) {
        menuToggle.addEventListener('click', () => {
          const isOpen = navigation.classList.toggle('is-open');
          menuToggle.setAttribute('aria-expanded', String(isOpen));
        });

        pageLinks.forEach((link) => {
          link.addEventListener('click', () => {
            navigation.classList.remove('is-open');
            menuToggle.setAttribute('aria-expanded', 'false');
          });
        });

        document.addEventListener('click', (event) => {
          if (!navigation.contains(event.target) && !menuToggle.contains(event.target)) {
            navigation.classList.remove('is-open');
            menuToggle.setAttribute('aria-expanded', 'false');
          }
        });
      }

      function openPurchaseDialog(plan) {
        selectedPlan = plan;
        purchasePlanName.textContent = selectedPlan.name;
        purchaseAmount.textContent = selectedPlan.price;
        paymentStatus.textContent = '';
        document.querySelectorAll('input[name="payment-method"]').forEach((input) => {
          input.checked = false;
        });
        purchaseDialog.showModal();
      }

      const planSearchInput = document.getElementById('plan-search');
      const planBedroomsSelect = document.getElementById('plan-bedrooms');
      const planPriceSelect = document.getElementById('plan-price');
      const planFloorsSelect = document.getElementById('plan-floors');
      const planStyleSelect = document.getElementById('plan-style');
      const clearPlanFiltersButton = document.getElementById('clear-filters');
      const planCards = document.querySelectorAll('.plan-card');

      function applyPlanFilters() {
        const searchValue = planSearchInput.value.trim().toLowerCase();
        const selectedBedrooms = planBedroomsSelect.value;
        const selectedPrice = planPriceSelect.value;
        const selectedFloors = planFloorsSelect.value;
        const selectedStyle = planStyleSelect.value;

        planCards.forEach((card) => {
          const title = (card.dataset.planTitle || '').toLowerCase();
          const planId = (card.dataset.planId || '').toLowerCase();
          const style = (card.dataset.style || '').toLowerCase();
          const bedrooms = Number(card.dataset.bedrooms || 0);
          const price = Number(card.dataset.price || 0);
          const floors = Number(card.dataset.floors || 0);

          const matchesSearch = !searchValue || title.includes(searchValue) || planId.includes(searchValue) || style.includes(searchValue);
          const matchesBedrooms = !selectedBedrooms || bedrooms === Number(selectedBedrooms);
          const matchesPrice = !selectedPrice || (
            selectedPrice === 'under-2000' ? price < 2000 :
            selectedPrice === '2000-2500' ? price >= 2000 && price <= 2500 :
            selectedPrice === '2500-plus' ? price >= 2500 :
            true
          );
          const matchesFloors = !selectedFloors || floors === Number(selectedFloors);
          const matchesStyle = !selectedStyle || style === selectedStyle;

          card.hidden = !(matchesSearch && matchesBedrooms && matchesPrice && matchesFloors && matchesStyle);
        });
      }

      [planSearchInput, planBedroomsSelect, planPriceSelect, planFloorsSelect, planStyleSelect].forEach((filterControl) => {
        filterControl.addEventListener('input', applyPlanFilters);
        filterControl.addEventListener('change', applyPlanFilters);
      });

      clearPlanFiltersButton.addEventListener('click', () => {
        planSearchInput.value = '';
        planBedroomsSelect.value = '';
        planPriceSelect.value = '';
        planFloorsSelect.value = '';
        planStyleSelect.value = '';
        applyPlanFilters();
      });

      document.querySelectorAll('.quick-buy').forEach((button) => {
        button.addEventListener('click', () => {
          openPurchaseDialog({
            name: button.dataset.plan,
            price: button.dataset.price,
          });
        });
      });

      document.getElementById('close-purchase-dialog').addEventListener('click', () => {
        purchaseDialog.close();
      });

      document.getElementById('continue-payment').addEventListener('click', () => {
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
        if (!paymentMethod || !selectedPlan) {
          paymentStatus.textContent = 'Select a payment method to continue.';
          return;
        }

        const message = `Hello, I would like to buy ${selectedPlan.name} for ${selectedPlan.price}. My preferred payment method is ${paymentMethod.value}.`;
        const whatsappUrl = new URL('https://wa.me/260774613994');
        whatsappUrl.searchParams.set('text', message);
        window.open(whatsappUrl.toString(), '_blank', 'noopener,noreferrer');
        paymentStatus.textContent = 'Your purchase request is ready in WhatsApp.';
      });

      accountTriggers.forEach((accountTrigger) => {
        accountTrigger.addEventListener('click', (event) => {
          event.preventDefault();
          accountSection.hidden = false;
          accountSection.classList.add('visible');
          accountSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });

      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
          tabs.forEach((item) => item.classList.remove('active'));
          cards.forEach((card) => card.classList.remove('active'));

          tab.classList.add('active');
          cards[index].classList.add('active');
        });
      });

      function formatFileSize(bytes) {
        if (bytes === 0) return '0 KB';
        const kb = bytes / 1024;
        if (kb < 1024) return `${Math.round(kb)} KB`;
        return `${(kb / 1024).toFixed(1)} MB`;
      }

      async function createListingImageData(imageFile) {
        const image = await createImageBitmap(imageFile);
        const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        image.close();
        return canvas.toDataURL('image/jpeg', 0.82);
      }

      function addUploadedPlanPreview(listing) {
        const card = document.createElement('article');
        card.className = 'plan-card uploaded-plan-preview';

        const photo = document.createElement('div');
        photo.className = 'plan-photo uploaded-plan-photo';

        const houseImage = document.createElement('img');
        houseImage.src = listing.imageData;
        houseImage.alt = listing.title;

        const badge = document.createElement('span');
        badge.className = 'plan-badge';
        badge.textContent = 'New listing';

        const quickBuyButton = document.createElement('button');
        quickBuyButton.className = 'quick-buy';
        quickBuyButton.type = 'button';
        quickBuyButton.textContent = 'Quick Buy';
        quickBuyButton.addEventListener('click', () => {
          openPurchaseDialog({
            name: listing.title,
            price: `K ${listing.price.toLocaleString('en-GB', { maximumFractionDigits: 2 })}`,
          });
        });

        photo.append(houseImage, badge, quickBuyButton);

        const body = document.createElement('div');
        body.className = 'plan-body';

        const title = document.createElement('h3');
        title.className = 'plan-title';
        title.textContent = listing.title;

        const verificationStatus = document.createElement('span');
        verificationStatus.className = 'verification-status';
        verificationStatus.textContent = 'Verification pending';

        const description = document.createElement('p');
        description.className = 'plan-description';
        description.textContent = listing.description;

        const priceRow = document.createElement('div');
        priceRow.className = 'plan-price-row';

        const price = document.createElement('span');
        price.className = 'plan-price';
        price.textContent = `From K ${listing.price.toLocaleString('en-GB', { maximumFractionDigits: 2 })}`;

        const status = document.createElement('span');
        status.className = 'plan-format';
        status.textContent = listing.formats.join(' + ');

        const rating = document.createElement('div');
        rating.className = 'plan-rating';
        rating.dataset.ratingId = listing.id;
        rating.setAttribute('role', 'group');
        rating.setAttribute('aria-label', `Rate ${listing.title}`);
        priceRow.append(price, rating, status);
        initialisePlanRating(rating);

        const ownerActions = document.createElement('div');
        ownerActions.className = 'uploaded-plan-owner-actions';

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-plan-button';
        deleteButton.type = 'button';
        deleteButton.setAttribute('aria-label', `Delete listing ${listing.title}`);
        deleteButton.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="m19 6-1 14H6L5 6"></path><path d="M10 11v5M14 11v5"></path></svg><span>Delete listing</span>';
        deleteButton.addEventListener('click', () => {
          if (!window.confirm(`Delete your listing “${listing.title}” from this browser?`)) {
            return;
          }

          savedUploadedPlans = savedUploadedPlans.filter((savedListing) => savedListing.id !== listing.id);
          try {
            localStorage.setItem('edp-uploaded-plans', JSON.stringify(savedUploadedPlans));
          } catch {
            // The card is still removed for this page view if storage is unavailable.
          }
          card.remove();
        });
        ownerActions.appendChild(deleteButton);

        const specs = document.createElement('div');
        specs.className = 'plan-specs';

        [
          [listing.floors, 'Floors'],
          [listing.bedrooms, 'Bedrooms'],
          [listing.bathrooms, 'Bathrooms'],
          [`${listing.plotLength.toLocaleString('en-GB', { maximumFractionDigits: 2 })} m`, 'Plot length'],
          [`${listing.plotWidth.toLocaleString('en-GB', { maximumFractionDigits: 2 })} m`, 'Plot width'],
          [`${(listing.plotLength * listing.plotWidth).toLocaleString('en-GB', { maximumFractionDigits: 2 })} m²`, 'Plot area'],
        ].forEach(([value, label]) => {
          const spec = document.createElement('div');
          spec.className = 'plan-spec';
          const measurement = document.createElement('strong');
          measurement.textContent = value;
          const caption = document.createElement('span');
          caption.textContent = label;
          spec.append(measurement, caption);
          specs.appendChild(spec);
        });

        body.append(title, verificationStatus, description, priceRow, specs, ownerActions);
        card.append(photo, body);
        plansGrid.appendChild(card);
        return card;
      }

      savedUploadedPlans.forEach(addUploadedPlanPreview);

      function renderFiles(fileArray) {
        fileList.innerHTML = '';
        uploadProgressWrap.hidden = fileArray.length === 0;
        uploadSubmit.hidden = fileArray.length === 0;
        uploadProgress.style.width = '0%';
        uploadProgressLabel.textContent = '0% uploaded';

        if (!fileArray.length) {
          return;
        }

        fileArray.forEach((file) => {
          const item = document.createElement('div');
          item.className = 'upload-file-item';

          const fileName = document.createElement('div');
          fileName.className = 'file-name';
          fileName.innerHTML = `<span class="file-type">${file.name.split('.').pop().toUpperCase().slice(0, 3)}</span>${file.name}`;

          const actions = document.createElement('div');
          actions.className = 'upload-file-actions';

          const size = document.createElement('span');
          size.className = 'file-size';
          size.textContent = formatFileSize(file.size);

          const removeButton = document.createElement('button');
          removeButton.type = 'button';
          removeButton.className = 'remove-file';
          removeButton.textContent = '×';
          removeButton.title = 'Remove file';
          removeButton.addEventListener('click', () => {
            const remainingFiles = Array.from(uploadInput.files).filter((f) => f !== file);
            const dataTransfer = new DataTransfer();
            remainingFiles.forEach((f) => dataTransfer.items.add(f));
            uploadInput.files = dataTransfer.files;
            renderFiles(Array.from(uploadInput.files));
          });

          actions.appendChild(size);
          actions.appendChild(removeButton);
          item.appendChild(fileName);
          item.appendChild(actions);
          fileList.appendChild(item);
        });

      }

      uploadInput.addEventListener('change', (event) => {
        submitUploadButton.disabled = false;
        renderFiles(Array.from(event.target.files));
      });

      listingImageInput.addEventListener('change', () => {
        submitUploadButton.disabled = false;
        if (listingPhotoObjectUrl) {
          URL.revokeObjectURL(listingPhotoObjectUrl);
          listingPhotoObjectUrl = null;
        }

        const imageFile = listingImageInput.files[0];
        if (!imageFile || !imageFile.type.startsWith('image/')) {
          listingPhotoPreviewWrap.hidden = true;
          listingPhotoName.textContent = 'Choose the house photo';
          return;
        }

        listingPhotoObjectUrl = URL.createObjectURL(imageFile);
        listingPhotoPreview.src = listingPhotoObjectUrl;
        listingPhotoPreviewWrap.hidden = false;
        listingPhotoName.textContent = imageFile.name;
      });

      [listingTitleInput, listingPriceInput, listingFloorsInput, listingBedroomsInput, listingBathroomsInput, plotLengthInput, plotWidthInput, listingDescriptionInput].forEach((input) => {
        input.addEventListener('input', () => {
          submitUploadButton.disabled = false;
        });
      });

      ['dragenter', 'dragover'].forEach((eventName) => {
        uploadCard.addEventListener(eventName, (event) => {
          event.preventDefault();
          uploadCard.style.borderColor = 'rgba(199, 111, 61, 0.8)';
          uploadCard.style.background = 'rgba(199, 111, 61, 0.08)';
        });
      });

      ['dragleave', 'drop'].forEach((eventName) => {
        uploadCard.addEventListener(eventName, (event) => {
          event.preventDefault();
          uploadCard.style.borderColor = 'rgba(199, 111, 61, 0.4)';
          uploadCard.style.background = 'linear-gradient(180deg, rgba(199, 111, 61, 0.04), rgba(199, 111, 61, 0.01))';
        });
      });

      uploadCard.addEventListener('drop', (event) => {
        const droppedFiles = Array.from(event.dataTransfer.files);
        uploadInput.files = event.dataTransfer.files;
        renderFiles(droppedFiles);
      });

      submitUploadButton.addEventListener('click', () => {
        const files = Array.from(uploadInput.files || []);
        if (!files.length) {
          uploadProgressWrap.hidden = false;
          uploadProgressLabel.textContent = 'Choose at least one PDF, DWG, or DXF plan file.';
          return;
        }

        const imageFile = listingImageInput.files[0];
        if (!imageFile || !imageFile.type.startsWith('image/')) {
          uploadProgressLabel.textContent = 'Choose a photo of the house for the listing.';
          listingImageInput.focus();
          return;
        }

        const requiredFields = [listingTitleInput, listingPriceInput, listingFloorsInput, listingBedroomsInput, listingBathroomsInput, plotLengthInput, plotWidthInput, listingDescriptionInput];
        const invalidField = requiredFields.find((input) => !input.value.trim() || !input.checkValidity());
        if (invalidField) {
          uploadProgressLabel.textContent = 'Complete all plan details before submitting.';
          invalidField.focus();
          invalidField.reportValidity();
          return;
        }

        const listing = {
          id: `upload-${Date.now()}`,
          title: listingTitleInput.value.trim(),
          price: Number(listingPriceInput.value),
          floors: Number(listingFloorsInput.value),
          bedrooms: Number(listingBedroomsInput.value),
          bathrooms: Number(listingBathroomsInput.value),
          plotLength: Number(plotLengthInput.value),
          plotWidth: Number(plotWidthInput.value),
          description: listingDescriptionInput.value.trim(),
          formats: [...new Set(files.map((file) => file.name.split('.').pop().toUpperCase()))],
        };

        const completeUpload = async () => {
          let uploadMessage = 'Listing added to Featured for this session; browser storage could not save it.';
          try {
            listing.imageData = await createListingImageData(imageFile);
            const updatedPlans = [...savedUploadedPlans, listing];
            localStorage.setItem('edp-uploaded-plans', JSON.stringify(updatedPlans));
            savedUploadedPlans = updatedPlans;
            uploadMessage = 'Listing saved in this browser and added to Featured. Online publishing is not connected.';
          } catch {
            listing.imageData = URL.createObjectURL(imageFile);
          }

          const preview = addUploadedPlanPreview(listing);
          uploadInput.value = '';
          renderFiles([]);
          listingFormFields.forEach((input) => {
            input.value = '';
          });
          listingImageInput.value = '';
          if (listingPhotoObjectUrl) {
            URL.revokeObjectURL(listingPhotoObjectUrl);
            listingPhotoObjectUrl = null;
          }
          listingPhotoPreview.removeAttribute('src');
          listingPhotoPreviewWrap.hidden = true;
          listingPhotoName.textContent = 'Choose the house photo';
          submitUploadButton.disabled = true;
          uploadProgressWrap.hidden = false;
          uploadProgress.style.width = '100%';
          uploadProgressLabel.textContent = uploadMessage;
          preview.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };

        let progress = 0; submitUploadButton.disabled = true;
        const interval = setInterval(() => {
          progress += 20;
          uploadProgress.style.width = `${progress}%`;
          uploadProgressLabel.textContent = `${progress}% uploaded`;

          if (progress >= 100) {
            clearInterval(interval);
            completeUpload();
          }
        }, 250);
      });