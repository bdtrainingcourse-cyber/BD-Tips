document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const searchForm = document.getElementById('search-form');
    const companyNameInput = document.getElementById('company-name');
    const companyDomainInput = document.getElementById('company-domain');
    const locationInput = document.getElementById('location');
    const searchPagesSelect = document.getElementById('search-pages');
    const apolloApiKeyInput = document.getElementById('apollo-api-key');

    const tagInput = document.getElementById('tag-input');
    const tagsWrapper = document.getElementById('tags-wrapper');
    const searchBtn = document.getElementById('search-btn');
    const btnText = searchBtn.querySelector('.btn-text');
    const btnLoader = searchBtn.querySelector('.btn-loader');
    
    const consoleLogs = document.getElementById('console-logs');
    const terminalStatus = document.getElementById('terminal-status');
    const progressContainer = document.getElementById('progress-container');
    const progressStepName = document.getElementById('progress-step-name');
    const progressPercent = document.getElementById('progress-percent');
    const progressFill = document.getElementById('progress-fill');
    
    const resultsPanel = document.getElementById('results-panel');
    const resultsCount = document.getElementById('results-count');
    const tableSearch = document.getElementById('table-search');
    const resultsTbody = document.getElementById('results-tbody');
    
    const btnCopyEmails = document.getElementById('btn-copy-emails');
    const btnExportCsv = document.getElementById('btn-export-csv');
    const btnExportJson = document.getElementById('btn-export-json');
    
    // Modal Elements
    const detailModal = document.getElementById('detail-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalPersonName = document.getElementById('modal-person-name');
    const modalPersonTitle = document.getElementById('modal-person-title');
    const modalPersonCompany = document.getElementById('modal-person-company');
    const modalPersonLinkedin = document.getElementById('modal-person-linkedin');
    const modalEmailList = document.getElementById('modal-email-list');
    const modalPhoneList = document.getElementById('modal-phone-list');
    const modalEnrichNotes = document.getElementById('modal-enrich-notes');
    const btnModalCopyAll = document.getElementById('btn-modal-copy-all');

    // Unlock Modal Elements
    const unlockModal = document.getElementById('unlock-modal');
    const unlockModalCloseBtn = document.getElementById('unlock-modal-close-btn');
    const unlockForm = document.getElementById('unlock-form');
    const unlockEmailInput = document.getElementById('unlock-email-input');
    let pendingUnlockAction = null;

    function requireEmailUnlock(callback) {
        if (localStorage.getItem('user_gated_email')) {
            if (callback) callback();
            return true;
        }
        pendingUnlockAction = callback;
        unlockModal.classList.remove('hidden');
        return false;
    }

    // State
    let manualTags = ['Business Development', 'B2B', 'Sales', 'Partnerships'];
    let generatedTags = [];
    let excludedGeneratedTags = [];
    let activeTags = [...manualTags];
    let searchResults = [];

    if (localStorage.getItem('apollo_api_key')) apolloApiKeyInput.value = localStorage.getItem('apollo_api_key');

    // --- Search Provider Selection Handling ---
    const searchMethodSelect = document.getElementById('search-method');
    const apolloKeyGroup = document.getElementById('apollo-key-group');

    searchMethodSelect.addEventListener('change', () => {
        if (searchMethodSelect.value === 'scraper') {
            apolloKeyGroup.style.display = 'none';
        } else {
            apolloKeyGroup.style.display = 'flex';
        }
    });

    // --- Tag Input System ---
    function renderTags() {
        tagsWrapper.innerHTML = '';
        activeTags.forEach(tag => {
            const span = document.createElement('span');
            const isGenerated = generatedTags.includes(tag);
            span.className = isGenerated ? 'tag generated-tag' : 'tag';
            span.setAttribute('data-val', tag);
            
            // Safe text content (no innerHTML)
            const textNode = document.createTextNode(tag + ' ');
            span.appendChild(textNode);
            
            // Dynamic close element
            const closeSpan = document.createElement('span');
            closeSpan.className = 'tag-close';
            closeSpan.textContent = '×';
            closeSpan.addEventListener('click', () => {
                removeTag(tag);
            });
            span.appendChild(closeSpan);
            tagsWrapper.appendChild(span);
        });
    }

    function addTag(tag) {
        const cleanTag = tag.trim();
        if (cleanTag) {
            // Remove from exclusion if manually added
            excludedGeneratedTags = excludedGeneratedTags.filter(t => t !== cleanTag);
            if (!manualTags.includes(cleanTag) && !generatedTags.includes(cleanTag)) {
                manualTags.push(cleanTag);
            }
            activeTags = [...new Set([...manualTags, ...generatedTags])];
            renderTags();
        }
    }

    function removeTag(tag) {
        if (manualTags.includes(tag)) {
            manualTags = manualTags.filter(t => t !== tag);
        }
        if (generatedTags.includes(tag)) {
            generatedTags = generatedTags.filter(t => t !== tag);
            if (!excludedGeneratedTags.includes(tag)) {
                excludedGeneratedTags.push(tag);
            }
        }
        activeTags = [...new Set([...manualTags, ...generatedTags])];
        renderTags();
    }

    tagInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(tagInput.value);
            tagInput.value = '';
        }
    });

    tagInput.addEventListener('blur', () => {
        if (tagInput.value) {
            addTag(tagInput.value);
            tagInput.value = '';
        }
    });

    // --- Matrix Title Generator & Selection Logic ---
    const seniorityCheckboxes = document.querySelectorAll('input[name="seniority"]');
    const departmentCheckboxes = document.querySelectorAll('input[name="department"]');

    function getMatrixTitles(seniority, department) {
        const titles = [];
        if (seniority === 'C-Level') {
            if (department === 'Enterprise B2B') {
                titles.push('Chief Revenue Officer', 'Head of Enterprise B2B');
            } else if (department === 'Channel Sales') {
                titles.push('Chief Commercial Officer', 'Head of Channel Sales');
            } else if (department === 'Partnerships') {
                titles.push('Chief Partnerships Officer', 'Head of Partnerships');
            } else if (department === 'Growth') {
                titles.push('Chief Growth Officer', 'Head of Growth');
            }
        } else if (seniority === 'VP') {
            titles.push(`VP of ${department}`, `Vice President of ${department}`);
        } else if (seniority === 'Director') {
            titles.push(`Director of ${department}`, `${department} Director`);
        } else if (seniority === 'Manager') {
            titles.push(`${department} Manager`, `Manager of ${department}`);
        } else if (seniority === 'Lead') {
            titles.push(`Lead ${department}`, `Head of ${department}`);
        }
        return titles;
    }

    function getSeniorityFallbacks(seniority) {
        if (seniority === 'C-Level') {
            return ['CEO', 'CTO', 'CFO', 'COO', 'Chief Executive Officer'];
        } else if (seniority === 'VP') {
            return ['Vice President', 'VP'];
        } else if (seniority === 'Director') {
            return ['Director'];
        } else if (seniority === 'Manager') {
            return ['Manager'];
        } else if (seniority === 'Lead') {
            return ['Team Lead', 'Lead'];
        }
        return [];
    }

    function getDepartmentFallbacks(department) {
        if (department === 'Enterprise B2B') {
            return ['Enterprise B2B', 'Enterprise Sales', 'B2B Sales'];
        } else if (department === 'Channel Sales') {
            return ['Channel Sales', 'Channel Manager', 'Channel Partner'];
        } else if (department === 'Partnerships') {
            return ['Partnerships', 'Partner Manager', 'Alliances'];
        } else if (department === 'Growth') {
            return ['Growth', 'Growth Hacker', 'Growth Marketing'];
        }
        return [];
    }

    function handleCheckboxChange() {
        const selectedSeniorities = Array.from(seniorityCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
        const selectedDepartments = Array.from(departmentCheckboxes).filter(cb => cb.checked).map(cb => cb.value);

        const newGenerated = [];

        if (selectedSeniorities.length > 0 && selectedDepartments.length > 0) {
            selectedSeniorities.forEach(sen => {
                selectedDepartments.forEach(dept => {
                    const titles = getMatrixTitles(sen, dept);
                    titles.forEach(t => {
                        if (!newGenerated.includes(t)) {
                            newGenerated.push(t);
                        }
                    });
                });
            });
        } else if (selectedSeniorities.length > 0) {
            selectedSeniorities.forEach(sen => {
                const titles = getSeniorityFallbacks(sen);
                titles.forEach(t => {
                    if (!newGenerated.includes(t)) {
                        newGenerated.push(t);
                    }
                });
            });
        } else if (selectedDepartments.length > 0) {
            selectedDepartments.forEach(dept => {
                const titles = getDepartmentFallbacks(dept);
                titles.forEach(t => {
                    if (!newGenerated.includes(t)) {
                        newGenerated.push(t);
                    }
                });
            });
        }

        generatedTags = newGenerated.filter(t => !excludedGeneratedTags.includes(t));
        activeTags = [...new Set([...manualTags, ...generatedTags])];
        renderTags();
    }

    [...seniorityCheckboxes, ...departmentCheckboxes].forEach(cb => {
        cb.addEventListener('change', handleCheckboxChange);
    });

    // --- Location Preset Dropdown Logic ---
    const locationPresetSelect = document.getElementById('location-preset');
    
    locationPresetSelect.addEventListener('change', () => {
        const val = locationPresetSelect.value;
        if (val === 'APAC') {
            locationInput.value = 'Vietnam, Singapore, Australia, Japan, APAC';
        } else if (val === 'Global') {
            locationInput.value = '';
        } else if (val === 'Vietnam') {
            locationInput.value = 'Vietnam';
        } else if (val === 'Singapore') {
            locationInput.value = 'Singapore';
        }
    });

    locationInput.addEventListener('input', () => {
        const val = locationInput.value.trim();
        if (val === 'Vietnam, Singapore, Australia, Japan, APAC') {
            locationPresetSelect.value = 'APAC';
        } else if (val === '') {
            locationPresetSelect.value = 'Global';
        } else if (val === 'Vietnam') {
            locationPresetSelect.value = 'Vietnam';
        } else if (val === 'Singapore') {
            locationPresetSelect.value = 'Singapore';
        } else {
            locationPresetSelect.value = 'Custom';
        }
    });

    // Render initial tags
    renderTags();

    // --- Logger functions ---
    function log(text, type = 'system') {
        const line = document.createElement('div');
        line.className = `log-line ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        line.textContent = `[${timestamp}] ${text}`;
        
        consoleLogs.appendChild(line);
        consoleLogs.scrollTop = consoleLogs.scrollHeight;
    }

    function clearLogs() {
        consoleLogs.innerHTML = '';
    }

    // --- UI Control Helpers ---
    function setSearchingState(isSearching, statusText = 'Searching') {
        if (isSearching) {
            searchBtn.disabled = true;
            btnText.textContent = 'Processing...';
            btnLoader.classList.remove('hidden');
            terminalStatus.textContent = statusText;
            terminalStatus.className = 'status-indicator searching';
            progressContainer.classList.remove('hidden');
        } else {
            searchBtn.disabled = false;
            btnText.textContent = 'Find Company PICs';
            btnLoader.classList.add('hidden');
            terminalStatus.textContent = 'Done';
            terminalStatus.className = 'status-indicator done';
        }
    }

    function updateProgressBar(percent, stepName) {
        progressFill.style.width = `${percent}%`;
        progressPercent.textContent = `${percent}%`;
        progressStepName.textContent = stepName;
    }

    // --- Table Rendering ---
    function renderResultsTable(contacts) {
        resultsTbody.innerHTML = '';
        if (contacts.length === 0) {
            resultsTbody.innerHTML = `<tr><td colspan="7" class="text-center">No profiles found matching search filters.</td></tr>`;
            return;
        }

        const emailUnlocked = !!localStorage.getItem('user_gated_email');

        contacts.forEach((contact, index) => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-index', index);
            
            const isGated = index >= 2 && !emailUnlocked;

            // Format emails badge
            let emailHtml = '<span class="text-light">Searching...</span>';
            if (contact.enriched) {
                if (contact.emails && contact.emails.length > 0) {
                    const primary = contact.emails[0];
                    let badgeClass = 'scraped';
                    if (contact.verification && contact.verification.status === 'Deliverable') {
                        badgeClass = 'verified';
                    } else if (contact.isGuessed) {
                        badgeClass = 'guessed';
                    }
                    
                    if (isGated) {
                        emailHtml = `<span class="status-badge ${badgeClass}" style="filter: blur(4px); pointer-events: none; opacity: 0.5; user-select: none;">name@company.com</span>`;
                    } else {
                        emailHtml = `<span class="status-badge ${badgeClass}">${primary}</span>`;
                        if (contact.emails.length > 1) {
                            emailHtml += ` <span class="confidence-inline">+${contact.emails.length - 1} more</span>`;
                        }
                    }
                } else {
                    emailHtml = '<span class="text-muted">Not Found</span>';
                }
            }

            // Format phones list
            let phoneHtml = '<span class="text-light">Searching...</span>';
            if (contact.enriched) {
                if (contact.phones && contact.phones.length > 0) {
                    if (isGated) {
                        phoneHtml = `<span style="filter: blur(4px); pointer-events: none; opacity: 0.5; user-select: none;"><code>0901234567</code></span>`;
                    } else {
                        phoneHtml = contact.phones.map(p => `<code>${p}</code>`).join(', ');
                    }
                } else {
                    phoneHtml = '<span class="text-muted">Not Found</span>';
                }
            }

            // Format Verification Status
            let verificationHtml = '<span class="text-light">Pending...</span>';
            if (contact.enriched) {
                if (contact.verification) {
                    let vClass = 'scraped';
                    if (contact.verification.status === 'Deliverable') vClass = 'verified';
                    if (contact.verification.status.includes('Blocked') || contact.verification.status.includes('timeout')) vClass = 'scraped';
                    if (contact.verification.status === 'Undeliverable') vClass = 'undeliverable';
                    
                    if (isGated) {
                        verificationHtml = `<span class="status-badge scraped" style="filter: blur(2px); pointer-events: none; opacity: 0.5; user-select: none;">Scraped</span>`;
                    } else {
                        verificationHtml = `<span class="status-badge ${vClass}">${contact.verification.status}</span>`;
                    }
                } else {
                    verificationHtml = '<span class="status-badge undeliverable">Not Verified</span>';
                }
            }

            let actionBtnHtml = `
                <button class="btn btn-secondary btn-view-detail" style="margin: 0; padding: 6px 12px; font-size: 0.8rem;" data-index="${index}">
                    🔍 View
                </button>
            `;
            if (isGated) {
                actionBtnHtml = `
                    <button class="btn btn-secondary btn-unlock-contacts" style="margin: 0; padding: 6px 12px; font-size: 0.8rem; background: #a20a0a; border-color: #a20a0a; color: white;" data-index="${index}">
                        🔓 Unlock
                    </button>
                `;
            }

            tr.innerHTML = `
                <td><strong>${contact.name}</strong></td>
                <td>${contact.title}</td>
                <td>
                    <a href="${contact.linkedin}" target="_blank" class="linkedin-badge-link">
                        🔗 Profile
                    </a>
                </td>
                <td>${emailHtml}</td>
                <td>${phoneHtml}</td>
                <td>${verificationHtml}</td>
                <td>${actionBtnHtml}</td>
            `;

            if (isGated) {
                tr.querySelector('.btn-unlock-contacts').addEventListener('click', (e) => {
                    e.stopPropagation();
                    requireEmailUnlock(() => {
                        openDetailsModal(index);
                    });
                });
            } else {
                tr.querySelector('.btn-view-detail').addEventListener('click', (e) => {
                    e.stopPropagation();
                    openDetailsModal(index);
                });
            }

            resultsTbody.appendChild(tr);
        });
    }

    // Filter results table dynamically
    tableSearch.addEventListener('input', () => {
        const query = tableSearch.value.toLowerCase();
        const filtered = searchResults.filter(c => 
            c.name.toLowerCase().includes(query) || 
            c.title.toLowerCase().includes(query) || 
            (c.emails && c.emails.some(e => e.toLowerCase().includes(query)))
        );
        renderResultsTable(filtered);
    });

    // --- Search & Enrichment Pipeline ---
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const company = companyNameInput.value.trim();
        const domain = companyDomainInput.value.trim();
        const location = locationInput.value.trim();
        const pages = parseInt(searchPagesSelect.value, 10);
        const apolloApiKey = apolloApiKeyInput.value.trim();
        const searchMethod = searchMethodSelect.value;

        if (apolloApiKey) localStorage.setItem('apollo_api_key', apolloApiKey);
        else localStorage.removeItem('apollo_api_key');
        clearLogs();
        resultsPanel.classList.add('hidden');
        searchResults = [];
        
        if (window.trackUserBehavior) {
            window.trackUserBehavior('pic_search', `Company: ${company}, Roles: ${activeTags.join(', ')}`);
        }
        
        log(`Initializing Search & Lead Finder pipeline...`, 'system');
        log(`Target Company: ${company}`, 'system');
        if (domain) log(`Target Domain: ${domain}`, 'system');
        log(`Target Job Titles: ${activeTags.join(', ')}`, 'system');
        if (location) log(`Location filter: ${location}`, 'system');
        log(`Search Depth: ${pages} pages of search engine indexing`, 'system');

        setSearchingState(true, 'Searching');
        updateProgressBar(10, 'Searching LinkedIn profiles on DuckDuckGo...');

        try {
            const seniority = Array.from(document.querySelectorAll('input[name="seniority"]:checked')).map(cb => cb.value);
            const department = Array.from(document.querySelectorAll('input[name="department"]:checked')).map(cb => cb.value);
            const geographic = document.getElementById('location-preset').value;

            // Step 1: Query LinkedIn profiles
            const searchResponse = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    company, 
                    domain, 
                    titles: activeTags, 
                    location, 
                    pages, 
                    apolloApiKey,
                    seniority,
                    department,
                    geographic,
                    searchMethod
                })
            });

            if (!searchResponse.ok) {
                let errorMsg = 'Failed to search profiles';
                const clonedResponse = searchResponse.clone();
                try {
                    const errData = await searchResponse.json();
                    errorMsg = errData.error || errorMsg;
                } catch (e) {
                    const text = await clonedResponse.text();
                    errorMsg = text.trim().substring(0, 150) || `HTTP Error ${searchResponse.status}`;
                }
                throw new Error(errorMsg);
            }

            const searchData = await searchResponse.json();
            const profiles = searchData.results;

            // Trigger action-based quest/point increase
            if (window.registerUserAction) {
                window.registerUserAction('pic_search');
            }
            
            log(`Search finished. Found ${profiles.length} LinkedIn profiles.`, 'success');
            
            if (profiles.length === 0) {
                log(`No profiles matched the criteria. Please try broadening your job title filters or company search query.`, 'error');
                setSearchingState(false);
                updateProgressBar(100, 'Done. No profiles found.');
                return;
            }

            // Initialize results state
            searchResults = profiles.map(p => ({
                ...p,
                enriched: false,
                emails: [],
                phones: [],
                verification: null
            }));

            // Display table and panel
            resultsCount.textContent = `Found ${profiles.length} profiles. Starting contact enrichment...`;
            renderResultsTable(searchResults);
            resultsPanel.classList.remove('hidden');

            terminalStatus.textContent = 'Enriching';
            terminalStatus.className = 'status-indicator enriching';

            // Step 2: Sequential Enrichment Queue (to prevent DDG blocking and show real-time updates)
            for (let i = 0; i < searchResults.length; i++) {
                const contact = searchResults[i];
                const percent = Math.round(10 + ((i / searchResults.length) * 85));
                
                updateProgressBar(percent, `Enriching contact ${i + 1}/${searchResults.length}: ${contact.name}`);
                log(`[Enrich ${i+1}/${searchResults.length}] Scrape contact details for ${contact.name} (${contact.title})`, 'enrich');

                try {
                    const enrichResponse = await fetch('/api/enrich', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: contact.name,
                            company: contact.company,
                            domain: domain || null,
                            email: contact.email || null,
                            phone: contact.phone || null
                        })
                    });

                    if (!enrichResponse.ok) {
                        throw new Error('Enrichment call failed');
                    }

                    const enrichedData = await enrichResponse.json();
                    
                    // Update state
                    searchResults[i] = {
                        ...contact,
                        enriched: true,
                        emails: enrichedData.emails,
                        phones: enrichedData.phones,
                        verification: enrichedData.verification,
                        isGuessed: enrichedData.isGuessed,
                        enrichReason: enrichedData.enrichReason,
                        domain: enrichedData.domain
                    };

                    // Log details
                    if (enrichedData.emails.length > 0) {
                        log(`[Enrich] Found Email: ${enrichedData.emails[0]} (${enrichedData.verification.status})`, 'success');
                    }
                    if (enrichedData.phones.length > 0) {
                        log(`[Enrich] Found Phone: ${enrichedData.phones.join(', ')}`, 'success');
                    }
                    if (enrichedData.emails.length === 0 && enrichedData.phones.length === 0) {
                        log(`[Enrich] No public email/phone located for ${contact.name}`, 'system');
                    }

                    // Re-render table row
                    renderResultsTable(searchResults);

                } catch (enrichErr) {
                    log(`[Enrich Error] Failed to enrich details for ${contact.name}: ${enrichErr.message}`, 'error');
                    searchResults[i].enriched = true;
                    searchResults[i].verification = { status: 'Failed', reason: enrichErr.message };
                    renderResultsTable(searchResults);
                }

                // Add small delay to throttle requests and look cool/natural
                if (i < searchResults.length - 1) {
                    await new Promise(r => setTimeout(r, 600));
                }
            }

            // Finished Pipeline
            log(`=======================================================`, 'system');
            log(`[System] Lead finder process completed successfully!`, 'success');
            log(`[System] Processed ${searchResults.length} leads.`, 'success');
            log(`=======================================================`, 'system');

            updateProgressBar(100, 'Done! Lead enrichment complete.');
            setSearchingState(false);
            resultsCount.textContent = `Enriched ${searchResults.length} profiles. Export your B2B leads list below.`;

        } catch (err) {
            log(`[Fatal Error] Pipeline aborted: ${err.message}`, 'error');
            setSearchingState(false);
            updateProgressBar(100, 'Pipeline failed.');
        }
    });

    // --- Modal Logic ---
    function openDetailsModal(index) {
        const contact = searchResults[index];
        if (!contact) return;

        modalPersonName.textContent = contact.name;
        modalPersonTitle.textContent = contact.title;
        modalPersonCompany.textContent = contact.company;
        modalPersonLinkedin.href = contact.linkedin;

        // Render emails
        modalEmailList.innerHTML = '';
        if (contact.emails && contact.emails.length > 0) {
            contact.emails.forEach(email => {
                const item = document.createElement('div');
                item.className = 'contact-item';
                
                let vStatus = 'Guessed format';
                if (contact.verification && contact.verification.status === 'Deliverable') {
                    vStatus = 'SMTP Verified Deliverable';
                } else if (contact.verification) {
                    vStatus = contact.verification.status;
                }

                item.innerHTML = `
                    <span class="contact-value">${email}</span>
                    <span class="status-badge ${contact.verification && contact.verification.status === 'Deliverable' ? 'verified' : (contact.isGuessed ? 'guessed' : 'scraped')}">${vStatus}</span>
                `;
                modalEmailList.appendChild(item);
            });
        } else {
            modalEmailList.innerHTML = '<p class="text-light">No emails discovered for this contact.</p>';
        }

        // Render phones
        modalPhoneList.innerHTML = '';
        if (contact.phones && contact.phones.length > 0) {
            contact.phones.forEach(phone => {
                const item = document.createElement('div');
                item.className = 'contact-item';
                item.innerHTML = `
                    <span class="contact-value">${phone}</span>
                    <span class="status-badge verified">Scraped</span>
                `;
                modalPhoneList.appendChild(item);
            });
        } else {
            modalPhoneList.innerHTML = '<p class="text-light">No phone numbers discovered for this contact.</p>';
        }

        // Render intelligence notes
        if (contact.enrichReason) {
            modalEnrichNotes.innerHTML = `<p>${contact.enrichReason}</p>`;
        } else if (contact.isGuessed) {
            modalEnrichNotes.innerHTML = `<p>Email was generated using standard B2B patterns for <strong>${contact.domain}</strong> based on the person's name details. SMTP socket handshake tests were run to check availability.</p>`;
        } else {
            modalEnrichNotes.innerHTML = `<p>Email was extracted directly from public search engine indexing index snippets for this person's name and company domain query.</p>`;
        }

        // Copy button within modal
        btnModalCopyAll.onclick = () => {
            const emailStr = contact.emails.join(', ') || 'None';
            const phoneStr = contact.phones.join(', ') || 'None';
            const info = `Name: ${contact.name}\nTitle: ${contact.title}\nCompany: ${contact.company}\nLinkedIn: ${contact.linkedin}\nEmails: ${emailStr}\nPhones: ${phoneStr}`;
            navigator.clipboard.writeText(info).then(() => {
                alert('Contact information copied to clipboard!');
            });
        };

        detailModal.classList.remove('hidden');
    }

    modalCloseBtn.addEventListener('click', () => {
        detailModal.classList.add('hidden');
    });

    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) {
            detailModal.classList.add('hidden');
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !detailModal.classList.contains('hidden')) {
            detailModal.classList.add('hidden');
        }
    });

    // --- Export Actions ---
    btnCopyEmails.addEventListener('click', () => {
        requireEmailUnlock(() => {
            const emails = [];
            searchResults.forEach(c => {
                if (c.emails && c.emails.length > 0) {
                    emails.push(c.emails[0]);
                }
            });

            if (emails.length === 0) {
                alert('No emails found in this search result to copy.');
                return;
            }

            const uniqueEmails = [...new Set(emails)].join(', ');
            navigator.clipboard.writeText(uniqueEmails).then(() => {
                alert(`Copied ${emails.length} emails to clipboard!`);
            });
        });
    });

    btnExportCsv.addEventListener('click', () => {
        if (searchResults.length === 0) return;

        requireEmailUnlock(() => {
            let csvContent = "data:text/csv;charset=utf-8,";
            // Header
            csvContent += "Name,Job Title,Company,LinkedIn URL,Primary Email,All Emails,Phone Numbers,Verification Status,Verification Details\n";

            searchResults.forEach(c => {
                const name = `"${c.name.replace(/"/g, '""')}"`;
                const title = `"${c.title.replace(/"/g, '""')}"`;
                const company = `"${c.company.replace(/"/g, '""')}"`;
                const linkedin = `"${c.linkedin}"`;
                const primaryEmail = c.emails && c.emails.length > 0 ? `"${c.emails[0]}"` : '""';
                const allEmails = c.emails && c.emails.length > 0 ? `"${c.emails.join('; ')}"` : '""';
                const phones = c.phones && c.phones.length > 0 ? `"${c.phones.join('; ')}"` : '""';
                const status = c.verification ? `"${c.verification.status}"` : '"Pending"';
                const reason = c.verification ? `"${c.verification.reason.replace(/"/g, '""')}"` : '""';

                csvContent += `${name},${title},${company},${linkedin},${primaryEmail},${allEmails},${phones},${status},${reason}\n`;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            
            const filename = `b2b_leads_${searchResults[0].company.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            
            link.click();
            document.body.removeChild(link);
        });
    });

    btnExportJson.addEventListener('click', () => {
        if (searchResults.length === 0) return;

        requireEmailUnlock(() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(searchResults, null, 2));
            const link = document.createElement("a");
            link.setAttribute("href", dataStr);
            
            const filename = `b2b_leads_${searchResults[0].company.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            
            link.click();
            document.body.removeChild(link);
        });
    });

    // --- Unlock Modal Event Listeners ---
    unlockModalCloseBtn.addEventListener('click', () => {
        unlockModal.classList.add('hidden');
        pendingUnlockAction = null;
    });

    unlockModal.addEventListener('click', (e) => {
        if (e.target === unlockModal) {
            unlockModal.classList.add('hidden');
            pendingUnlockAction = null;
        }
    });

    unlockForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = unlockEmailInput.value.trim();
        if (email && email.includes('@')) {
            localStorage.setItem('user_gated_email', email);
            unlockModal.classList.add('hidden');
            
            // Log email to backend serverless function
            try {
                await fetch('/api/log-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, tool: 'PIC Finder' })
                });
            } catch (err) {
                console.error('Failed to log email to backend:', err);
            }

            // Re-render table to reveal the information
            renderResultsTable(searchResults);

            if (pendingUnlockAction) {
                pendingUnlockAction();
                pendingUnlockAction = null;
            }
        }
    });

    // ==========================================================================
    // ALUMNI VIP PIC CONCIERGE LOGIC (MỤC SỐ 4)
    // ==========================================================================
    const GAS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzhevaZUCV0ITOxOeeFTx4lFG4jqknpCFV1EJ4l_L75-zkgmmY0eJlKc68jEgk_mVU/exec';
    
    // Elements
    const tabBtnVip = document.getElementById('tab-btn-vip');
    const tabBtnScraper = document.getElementById('tab-btn-scraper');
    const alumniVipSection = document.getElementById('alumni-vip-section');
    const scraperPortalSection = document.getElementById('scraper-portal-section');

    const vipGateCard = document.getElementById('vip-gate-card');
    const vipDashboardCard = document.getElementById('vip-dashboard-card');
    const vipAuthForm = document.getElementById('vip-auth-form');
    const vipPasscodeInput = document.getElementById('vip-passcode-input');
    const vipEmailInput = document.getElementById('vip-email-input');
    const vipErrorMsg = document.getElementById('vip-error-msg');
    const btnQuickFillPass = document.getElementById('btn-quick-fill-pass');
    const btnLockVip = document.getElementById('btn-lock-vip');

    const vipDisplayNickname = document.getElementById('vip-display-nickname');
    const vipDisplayEmail = document.getElementById('vip-display-email');
    const vipCreditsVal = document.getElementById('vip-credits-val');
    const vipProgressFill = document.getElementById('vip-progress-fill');
    const vipExpiryText = document.getElementById('vip-expiry-text');

    const vipRequestForm = document.getElementById('vip-request-form');
    const picTargetCompany = document.getElementById('pic-target-company');
    const picTargetRole = document.getElementById('pic-target-role');
    const picTargetNotes = document.getElementById('pic-target-notes');
    const picSubmitFeedback = document.getElementById('pic-submit-feedback');
    const btnSubmitPic = document.getElementById('btn-submit-pic');
    const vipHistoryList = document.getElementById('vip-history-list');
    const vipHistoryCount = document.getElementById('vip-history-count');

    const labelDeptHr = document.getElementById('label-dept-hr');
    const labelDeptMkt = document.getElementById('label-dept-mkt');

    // Deterministic Funny BD Titles for instant client-side fallback
    const CLIENT_BD_TITLES = [
        "Săn Deal Khủng", "Bách Phát Bách Trúng", "Chốt Đơn Xuyên Màn Đêm",
        "Chiến Thần Cold Call", "Sát Thủ Doanh Số", "Vua Hẹn Gặp",
        "Đàm Phán Bất Bại", "Cãi Sếp Giành Hoa Hồng", "Chúa Tể Networking",
        "Bóp Còi Chốt Deal", "Thần Giao Kèo", "Kẻ Hủy Diệt Từ Chối",
        "Đào Mỏ Pitching", "Trùm Chuyển Đổi", "Thợ Săn Cá Mập",
        "Thần Gió Pipeline", "Tín Đồ Hợp Đồng", "Bậc Thầy Upsell",
        "Cá Mập Chốt Sales", "Chuyên Gia Đòi Nợ Xong Deal"
    ];

    function getFunnyNickname(name, email) {
        if (!name) name = "Chiến Binh BD";
        const parts = name.trim().split(/\s+/);
        const firstName = parts[parts.length - 1];
        const seed = ((email || name) + "BD_VIP_SALT").toLowerCase();
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash) + seed.charCodeAt(i);
            hash |= 0;
        }
        const title = CLIENT_BD_TITLES[Math.abs(hash) % CLIENT_BD_TITLES.length];
        return firstName + " " + title;
    }

    // Tab Switching
    if (tabBtnVip && tabBtnScraper) {
        tabBtnVip.addEventListener('click', () => {
            tabBtnVip.classList.add('active');
            tabBtnScraper.classList.remove('active');
            if (alumniVipSection) alumniVipSection.style.display = 'block';
            if (scraperPortalSection) scraperPortalSection.style.display = 'none';
        });

        tabBtnScraper.addEventListener('click', () => {
            tabBtnScraper.classList.add('active');
            tabBtnVip.classList.remove('active');
            if (alumniVipSection) alumniVipSection.style.display = 'none';
            if (scraperPortalSection) scraperPortalSection.style.display = 'block';
        });
    }

    // Department Pill Toggle (4 Blocks: HR, Marketing, C-Level, IT)
    const deptPills = [
        document.getElementById('label-dept-hr'),
        document.getElementById('label-dept-mkt'),
        document.getElementById('label-dept-clevel'),
        document.getElementById('label-dept-it')
    ].filter(Boolean);

    deptPills.forEach(pill => {
        pill.addEventListener('click', () => {
            deptPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const radio = pill.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        });
    });

    // Render Request History
    function renderVipHistory(historyArr) {
        if (!vipHistoryList) return;
        if (!historyArr || historyArr.length === 0) {
            vipHistoryList.innerHTML = `
                <div style="color: #cbd5e1; font-size: 0.95rem; text-align: center; padding: 25px; font-weight: 500;">
                    Bạn chưa gửi yêu cầu nào. Hãy gửi yêu cầu đầu tiên để Peter Võ hỗ trợ săn PIC nhé!
                </div>
            `;
            if (vipHistoryCount) vipHistoryCount.textContent = '0 yêu cầu';
            return;
        }

        if (vipHistoryCount) vipHistoryCount.textContent = `${historyArr.length} yêu cầu`;
        vipHistoryList.innerHTML = historyArr.map(item => `
            <div class="vip-history-item">
                <div class="vip-history-info">
                    <strong style="color: #ffffff; font-size: 1.05rem;">🏢 ${item.company}</strong> &nbsp;
                    <span style="color: #f3a83b; font-size: 0.9rem; font-weight: 700;">[${item.department}]</span>
                    <div class="vip-history-sub" style="color: #cbd5e1; margin-top: 4px;">
                        <span>🎯 Mục tiêu: ${item.role}</span> &bull; 
                        <span>📅 ${item.time || 'Vừa gửi'}</span>
                    </div>
                    ${item.notes ? `<div style="font-size: 0.85rem; color: #94a3b8; margin-top: 4px;">Ghi chú: ${item.notes}</div>` : ''}
                </div>
                <div class="vip-status-badge ${item.status === 'Đã Kết Nối' ? 'completed' : 'processing'}">
                    ${item.status || '⏳ Đang Xử Lý (24-48h)'}
                </div>
            </div>
        `).join('');
    }

    // Helper to get or generate persistent unique VIP User ID
    function getVipUserId(session) {
        if (!session) return 'UID_VIP';
        if (session.userId) return session.userId;
        const streakUid = localStorage.getItem('streak_user_id');
        if (streakUid) return streakUid;
        if (session.vipCode && session.vipCode.toUpperCase() !== 'BDTHUCCHIEN') {
            return session.vipCode.toUpperCase().replace(/\s+/g, '_');
        }
        const userEmail = (session.email || '').toLowerCase().trim();
        const cacheKey = userEmail ? `vip_uid_${userEmail}` : 'vip_uid_current';
        let uniqueUid = localStorage.getItem(cacheKey);
        if (!uniqueUid) {
            const cleanPrefix = (session.name || session.nickname || 'VIP').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
            const rand = Math.random().toString(36).substr(2, 6).toUpperCase();
            uniqueUid = cleanPrefix ? `UID_${cleanPrefix}_${rand}` : `UID_${rand}`;
            localStorage.setItem(cacheKey, uniqueUid);
        }
        return uniqueUid;
    }

    // Update VIP Session UI
    function renderVipSession(session) {
        if (!session) {
            if (vipGateCard) vipGateCard.style.display = 'block';
            if (vipDashboardCard) vipDashboardCard.style.display = 'none';
            return;
        }

        if (vipGateCard) vipGateCard.style.display = 'none';
        if (vipDashboardCard) vipDashboardCard.style.display = 'block';

        if (vipDisplayNickname) vipDisplayNickname.textContent = session.nickname || 'Chiến Binh BD';
        if (vipDisplayEmail) vipDisplayEmail.textContent = session.email || 'Alumni VIP Member';
        
        const credits = session.remainingCredits !== undefined ? session.remainingCredits : 3;
        if (vipCreditsVal) vipCreditsVal.textContent = credits;
        if (vipProgressFill) {
            const pct = Math.max(0, Math.min(100, (credits / 3) * 100));
            vipProgressFill.style.width = pct + '%';
            if (pct <= 33) vipProgressFill.style.background = '#ef4444';
            else if (pct <= 66) vipProgressFill.style.background = '#f59e0b';
            else vipProgressFill.style.background = 'linear-gradient(90deg, #f3a83b, #10b981)';
        }

        if (vipExpiryText && session.expiry) {
            vipExpiryText.textContent = `Hạn dùng: ${session.expiry} (3 tháng)`;
        }

        // Referral Link & Giver Mentality (Unique User ID Based)
        const refLinkInput = document.getElementById('vip-referral-link-input');
        const refTicketsLeft = document.getElementById('ref-tickets-left');
        const refCountDisplay = document.getElementById('ref-count-display');
        const vipUserIdDisplay = document.getElementById('vip-user-id-display');

        const vipUserId = getVipUserId(session);
        session.userId = vipUserId;
        try { localStorage.setItem('alumni_vip_session', JSON.stringify(session)); } catch (e) {}

        if (vipUserIdDisplay) vipUserIdDisplay.textContent = vipUserId;

        const cleanDisplayName = (session.nickname || session.name || 'Alumni VIP').trim();
        const cleanNameParam = cleanDisplayName.replace(/\s+/g, '_');
        const generatedRefLink = `https://www.bdbinhdanhocvu.com/?ref=${encodeURIComponent(vipUserId)}&name=${encodeURIComponent(cleanNameParam)}`;
        
        if (refLinkInput) refLinkInput.value = generatedRefLink;
        
        const refKeyId = `b2b_ref_count_${vipUserId}`;
        const refKeyName = `b2b_ref_count_${cleanNameParam}`;
        const refKeyEmail = `b2b_ref_count_${session.email || 'default'}`;
        const refCount = Math.max(
            parseInt(localStorage.getItem(refKeyId) || '0', 10),
            parseInt(localStorage.getItem(refKeyName) || '0', 10),
            parseInt(localStorage.getItem(refKeyEmail) || '0', 10)
        );
        if (refCountDisplay) refCountDisplay.textContent = refCount;
        if (refTicketsLeft) refTicketsLeft.textContent = refCount;

        const history = JSON.parse(localStorage.getItem(`vip_history_${session.email || 'default'}`) || '[]');
        renderVipHistory(history);
    }

    // Referral Copy Handlers
    const btnCopyRefLink = document.getElementById('btn-copy-ref-link');
    const btnCopyRefMsg = document.getElementById('btn-copy-ref-msg');

    if (btnCopyRefLink) {
        btnCopyRefLink.addEventListener('click', () => {
            const refLinkInput = document.getElementById('vip-referral-link-input');
            if (refLinkInput) {
                navigator.clipboard.writeText(refLinkInput.value).then(() => {
                    alert('Đã sao chép link Vé Mời VIP của bạn! Hãy gửi link này cho đồng nghiệp BD thân thiết nhé.');
                }).catch(() => {
                    refLinkInput.select();
                    document.execCommand('copy');
                    alert('Đã sao chép link Vé Mời VIP!');
                });
            }
        });
    }

    if (btnCopyRefMsg) {
        btnCopyRefMsg.addEventListener('click', () => {
            const refLinkInput = document.getElementById('vip-referral-link-input');
            const link = refLinkInput ? refLinkInput.value : 'https://www.bdbinhdanhocvu.com';
            const sampleMsg = `Chào bạn, mình vừa nhận được Vé Mời VIP độc quyền từ BD Bình Dân Học Vụ dành cho anh em làm B2B BD thực chiến. Mình gửi tặng bạn 1 suất: khi đăng ký qua link này bạn sẽ được nhận ngay 50 BD-Points và tải miễn phí Ebook thực chiến đầu tiên: ${link}`;
            navigator.clipboard.writeText(sampleMsg).then(() => {
                alert('Đã sao chép lời mời mẫu! Bạn có thể dán gửi Zalo/LinkedIn ngay cho đồng nghiệp.');
            }).catch(() => {
                alert('Lời mời mẫu:\n' + sampleMsg);
            });
        });
    }

    // Authenticate / Unlock
    async function unlockVip(passcode, emailInput) {
        const cleanPass = (passcode || '').trim();
        const cleanEmail = (emailInput || '').trim().toLowerCase();

        if (vipErrorMsg) vipErrorMsg.style.display = 'none';

        // 1. Kiểm tra Mật khẩu Master hoặc VIP Code cá nhân (BD-xxxx, VIP-xxxx, BDTHUCCHIEN)
        const isMasterPass = cleanPass.toUpperCase() === 'BDTHUCCHIEN';
        const isVipFormat = cleanPass.toUpperCase().startsWith('BD-') || cleanPass.toUpperCase().startsWith('VIP-') || cleanPass.length >= 4;

        if (!cleanPass) {
            if (vipErrorMsg) {
                vipErrorMsg.textContent = 'Vui lòng nhập Mật khẩu VIP riêng biệt gửi qua email của bạn.';
                vipErrorMsg.style.display = 'block';
            }
            return false;
        }

        // 2. Thử xác thực với Google Apps Script Webhook nếu có mạng
        let session = null;
        try {
            const resp = await fetch(`${GAS_WEBHOOK_URL}?action=verifyAlumni&passcode=${encodeURIComponent(cleanPass)}&email=${encodeURIComponent(cleanEmail)}`, {
                method: 'GET',
                mode: 'cors'
            });
            if (resp.ok) {
                const data = await resp.json();
                if (data.success && data.isAlumni) {
                    session = {
                        isVip: true,
                        name: data.name,
                        nickname: data.nickname,
                        email: data.email || cleanEmail || 'alumni@bdbinhdanhocvu.com',
                        remainingCredits: data.remainingCredits !== undefined ? data.remainingCredits : 3,
                        expiry: data.expiry || '3 Tháng',
                        vipCode: data.vipCode || cleanPass,
                        userId: data.userId || null
                    };
                }
            }
        } catch (netErr) {
            console.warn('Network call to GAS verifyAlumni failed, using client-side validation:', netErr);
        }

        // 3. Fallback client-side validation nếu pass hợp lệ
        if (!session && (isMasterPass || isVipFormat)) {
            const existingRaw = localStorage.getItem('alumni_vip_session');
            const existing = existingRaw ? JSON.parse(existingRaw) : null;
            const currentCredits = (existing && existing.remainingCredits !== undefined) ? existing.remainingCredits : 3;

            session = {
                isVip: true,
                name: (existing && existing.name) || (cleanEmail ? cleanEmail.split('@')[0] : 'Alumni VIP'),
                nickname: getFunnyNickname(cleanEmail ? cleanEmail.split('@')[0] : 'Tân Võ Phước', cleanEmail),
                email: cleanEmail || (existing && existing.email) || 'alumni@bdbinhdanhocvu.com',
                remainingCredits: currentCredits,
                expiry: '90 Ngày',
                vipCode: cleanPass,
                userId: (existing && existing.userId) || null
            };
        }

        if (session) {
            localStorage.setItem('alumni_vip_session', JSON.stringify(session));
            renderVipSession(session);
            return true;
        } else {
            if (vipErrorMsg) {
                vipErrorMsg.textContent = 'Mật khẩu VIP không hợp lệ. Vui lòng kiểm tra lại.';
                vipErrorMsg.style.display = 'block';
            }
            return false;
        }
    }

    // Event: Quick Fill Pass
    if (btnQuickFillPass) {
        btnQuickFillPass.addEventListener('click', () => {
            if (vipPasscodeInput) vipPasscodeInput.value = 'BDTHUCCHIEN';
            if (vipEmailInput && !vipEmailInput.value) {
                const savedEmail = localStorage.getItem('user_email') || localStorage.getItem('user_gated_email') || '';
                if (savedEmail) vipEmailInput.value = savedEmail;
            }
            unlockVip('BDTHUCCHIEN', vipEmailInput ? vipEmailInput.value : '');
        });
    }

    // Event: Submit Unlock Form
    if (vipAuthForm) {
        vipAuthForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pass = vipPasscodeInput ? vipPasscodeInput.value : '';
            const email = vipEmailInput ? vipEmailInput.value : '';
            unlockVip(pass, email);
        });
    }

    // Event: Lock / Logout
    if (btnLockVip) {
        btnLockVip.addEventListener('click', () => {
            localStorage.removeItem('alumni_vip_session');
            renderVipSession(null);
        });
    }

    // Event: Submit PIC Request
    if (vipRequestForm) {
        vipRequestForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const sessionRaw = localStorage.getItem('alumni_vip_session');
            if (!sessionRaw) {
                alert('Vui lòng mở khóa bằng Mật Khẩu VIP trước khi gửi yêu cầu.');
                renderVipSession(null);
                return;
            }
            const session = JSON.parse(sessionRaw);

            if (session.remainingCredits <= 0) {
                alert('Bạn đã sử dụng hết 3/3 lượt tìm PIC đặc quyền. Vui lòng liên hệ trực tiếp Peter Võ qua Zalo: 0931.100.569.');
                return;
            }

            const company = picTargetCompany ? picTargetCompany.value.trim() : '';
            const selectedDeptInput = document.querySelector('input[name="target_dept"]:checked');
            const department = selectedDeptInput ? selectedDeptInput.value : 'Nhân Sự (HR)';
            const role = picTargetRole ? picTargetRole.value.trim() : '';
            const notes = picTargetNotes ? picTargetNotes.value.trim() : '';

            if (!company || !role) {
                alert('Vui lòng nhập Tên Doanh Nghiệp Mục Tiêu và Vị Trí / Mục Tiêu Kết Nối.');
                return;
            }

            if (btnSubmitPic) {
                btnSubmitPic.disabled = true;
                btnSubmitPic.textContent = '⏳ Đang gửi yêu cầu...';
            }

            // Trừ 1 lượt
            session.remainingCredits = Math.max(0, session.remainingCredits - 1);
            localStorage.setItem('alumni_vip_session', JSON.stringify(session));

            // Lưu vào lịch sử local
            const histKey = `vip_history_${session.email || 'default'}`;
            const history = JSON.parse(localStorage.getItem(histKey) || '[]');
            const newRequest = {
                company: company,
                department: department,
                role: role,
                notes: notes,
                time: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                status: '⏳ Đang Tìm Kiếm'
            };
            history.unshift(newRequest);
            localStorage.setItem(histKey, JSON.stringify(history));

            // Gửi dữ liệu lên Google Apps Script Webhook
            try {
                fetch(GAS_WEBHOOK_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'requestPIC',
                        email: session.email,
                        name: session.name,
                        nickname: session.nickname,
                        targetCompany: company,
                        department: department,
                        targetRole: role,
                        notes: notes,
                        vipCode: session.vipCode || 'BDTHUCCHIEN'
                    })
                }).catch(e => console.warn('Background sync to GAS failed:', e));
            } catch (err) {}

            // Cập nhật UI
            if (picSubmitFeedback) {
                picSubmitFeedback.style.display = 'block';
                picSubmitFeedback.style.background = 'rgba(16, 185, 129, 0.15)';
                picSubmitFeedback.style.border = '1px solid #10b981';
                picSubmitFeedback.style.color = '#6ee7b7';
                picSubmitFeedback.innerHTML = `
                    🎉 <strong>Yêu cầu tìm PIC đã được gửi thành công!</strong><br>
                    Anh Peter Võ sẽ trực tiếp rà soát mạng lưới 30,000+ LinkedIn connections và phản hồi thông tin PIC cho bạn qua Zalo/Email trong 24h - 48h tới.<br>
                    <span style="font-size: 0.85rem; color: #f3a83b; margin-top: 4px; display: inline-block;">Số lượt còn lại của bạn: ${session.remainingCredits} / 3 lượt.</span>
                `;
            }

            renderVipSession(session);

            // Reset form input
            if (picTargetCompany) picTargetCompany.value = '';
            if (picTargetRole) picTargetRole.value = '';
            if (picTargetNotes) picTargetNotes.value = '';

            if (btnSubmitPic) {
                btnSubmitPic.disabled = false;
                btnSubmitPic.textContent = '🚀 Gửi Yêu Cầu Tìm PIC Cho Anh Peter Võ';
            }
        });
    }

    // On Page Load: Check URL parameters & Local Session
    (function initVipPortal() {
        const urlParams = new URLSearchParams(window.location.search);
        const vipPassParam = urlParams.get('vip_pass') || urlParams.get('vip');
        const emailParam = urlParams.get('email') || urlParams.get('sync_email');
        const tabParam = urlParams.get('tab');

        if (tabParam === 'scraper') {
            if (tabBtnScraper) tabBtnScraper.click();
        }

        if (emailParam && vipEmailInput) {
            vipEmailInput.value = emailParam;
        }

        // Tự động mở khóa nếu có query param vip_pass=BDTHUCCHIEN
        if (vipPassParam) {
            if (vipPasscodeInput) vipPasscodeInput.value = vipPassParam;
            unlockVip(vipPassParam, emailParam || '');
            return;
        }

        // Kiểm tra session đã lưu trong localStorage
        const savedSession = localStorage.getItem('alumni_vip_session');
        if (savedSession) {
            try {
                const sess = JSON.parse(savedSession);
                renderVipSession(sess);
            } catch (e) {
                renderVipSession(null);
            }
        } else {
            renderVipSession(null);
        }
    })();

    // Expose for testing
    window.renderResultsTable = renderResultsTable;
    Object.defineProperty(window, 'searchResults', {
        get: () => searchResults,
        set: (val) => { searchResults = val; }
    });
});
