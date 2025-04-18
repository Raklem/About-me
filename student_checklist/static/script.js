document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        // Redirect to login page if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    // Get user email
    const userEmail = localStorage.getItem('userEmail') || '';
    
    // Setup account dropdown and logout functionality
    const accountBtn = document.getElementById('account-btn');
    const accountDropdown = document.getElementById('account-dropdown');
    const logoutBtn = document.getElementById('logout-btn');
    const userEmailSpan = document.getElementById('user-email');
    
    // Display username in account button
    const username = localStorage.getItem('username') || '';
    if (userEmailSpan) {
        userEmailSpan.textContent = username || userEmail;
    }
    
    // Toggle account dropdown
    if (accountBtn && accountDropdown) {
        accountBtn.addEventListener('click', function() {
            accountDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (!accountBtn.contains(event.target) && !accountDropdown.contains(event.target)) {
                accountDropdown.classList.remove('active');
            }
        });
    }
    
    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Clear login information
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('username');
            localStorage.removeItem('rememberUser');
            
            // Redirect to login page
            window.location.href = 'login.html';
        });
    }
    
    // Initialize local storage if not exists
    if (!localStorage.getItem('studentProfile')) {
        // Extract name from email (if available)
        let defaultName = '';
        if (userEmail) {
            const emailParts = userEmail.split('@');
            if (emailParts.length > 0) {
                // Convert format like "john.doe" to "John Doe"
                const namePart = emailParts[0].replace(/\./g, ' ');
                defaultName = namePart.replace(/\b\w/g, l => l.toUpperCase());
            }
        }
        
        localStorage.setItem('studentProfile', JSON.stringify({
            name: defaultName,
            id: '',
            major: '',
            degree: '',
            year: 1,
            graduation: '',
            totalCreditsRequired: 120
        }));
    }
    
    if (!localStorage.getItem('courses')) {
        localStorage.setItem('courses', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('semesters')) {
        localStorage.setItem('semesters', JSON.stringify([]));
    }
    
    // Load data from local storage
    loadProfile();
    loadCourses();
    loadSemesters();
    updateGPA();
    updateProgress();
    
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Add Course Modal
    const addCourseBtn = document.getElementById('add-course-btn');
    const addCourseModal = document.getElementById('add-course-modal');
    const editCourseModal = document.getElementById('edit-course-modal');
    const closeModalBtns = document.querySelectorAll('.close');
    
    if (addCourseBtn) {
        addCourseBtn.addEventListener('click', function() {
            // Update semester dropdown in add course modal
            updateSemesterDropdown();
            addCourseModal.style.display = 'block';
        });
    }
    
    // Add Semester Modal
    const addSemesterBtn = document.getElementById('add-semester-btn');
    const addSemesterModal = document.getElementById('add-semester-modal');
    const editSemesterModal = document.getElementById('edit-semester-modal');
    
    if (addSemesterBtn) {
        addSemesterBtn.addEventListener('click', function() {
            addSemesterModal.style.display = 'block';
        });
    }
    
    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Function to calculate grade and GPA from score
    function calculateGradeFromScore(score) {
        const scoreNum = parseFloat(score);
        let grade, gradeText, gpaValue;
        
        if (scoreNum >= 90) {
            grade = 'A';
            gpaValue = 4;
        } else if (scoreNum >= 80) {
            grade = 'B';
            gpaValue = 3;
        } else if (scoreNum >= 70) {
            grade = 'C';
            gpaValue = 2;
        } else if (scoreNum >= 60) {
            grade = 'D';
            gpaValue = 1;
        } else {
            grade = 'F';
            gpaValue = 0;
        }
        
        gradeText = `${grade} (${gpaValue}.0)`;
        
        return { grade, gradeText, gpaValue };
    }
    
    // Load profile data from local storage
    function loadProfile() {
        const profile = JSON.parse(localStorage.getItem('studentProfile')) || {};
        
        // Set form values
        if (document.getElementById('student-name')) {
            document.getElementById('student-name').value = profile.name || '';
        }
        if (document.getElementById('student-id')) {
            document.getElementById('student-id').value = profile.id || '';
        }
        if (document.getElementById('student-major')) {
            document.getElementById('student-major').value = profile.major || '';
        }
        if (document.getElementById('student-degree')) {
            document.getElementById('student-degree').value = profile.degree || '';
        }
        if (document.getElementById('student-year')) {
            document.getElementById('student-year').value = profile.year || 1;
        }
        if (document.getElementById('student-graduation')) {
            document.getElementById('student-graduation').value = profile.graduation || '';
        }
        if (document.getElementById('total-credits-required')) {
            document.getElementById('total-credits-required').value = profile.totalCreditsRequired || 120;
        }
        
        // Update profile display
        updateProfileDisplay(profile);
    }
    
    // Update profile display in UI
    function updateProfileDisplay(profile) {
        // Update dashboard
        const dashboardWelcome = document.querySelector('#dashboard h2');
        if (dashboardWelcome) {
            dashboardWelcome.textContent = profile.name ? `Welcome, ${profile.name}!` : 'Welcome!';
        }
        
        const dashboardMajor = document.querySelector('#dashboard p:nth-of-type(1)');
        if (dashboardMajor) {
            dashboardMajor.textContent = profile.major ? `Major: ${profile.major}` : 'Заполните информацию в профиле';
        }
        
        const dashboardGraduation = document.querySelector('#dashboard p:nth-of-type(2)');
        if (dashboardGraduation) {
            dashboardGraduation.textContent = profile.graduation ? `Expected Graduation: ${profile.graduation}` : 'Ожидаемый год выпуска: -';
        }
        
        // Update profile header
        const programValue = document.querySelector('.program-value');
        const degreeValue = document.querySelector('.degree-value');
        
        if (programValue) {
            programValue.textContent = profile.major || 'Computer Science';
        }
        if (degreeValue) {
            degreeValue.textContent = profile.degree || 'Bachelor of Science';
        }
    }
    
    // Add new course
    const addCourseForm = document.getElementById('add-course-form');
    const courseList = document.getElementById('course-list');
    const coursesEmptyState = document.getElementById('courses-empty-state');
    
    if (addCourseForm) {
        addCourseForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const courseCode = document.getElementById('course-code').value;
            const courseName = document.getElementById('course-name').value;
            const courseCredits = parseInt(document.getElementById('course-credits').value);
            const courseSemester = document.getElementById('course-semester').value;
            const courseStatus = document.getElementById('course-status').value;
            const courseScore = document.getElementById('course-score').value;
            
            let gradeInfo = { grade: '', gradeText: '', gpaValue: 0 };
            
            if (courseStatus === 'completed' && courseScore) {
                gradeInfo = calculateGradeFromScore(courseScore);
            }
            
            // Create new course object
            const newCourse = {
                id: Date.now().toString(),
                code: courseCode,
                name: courseName,
                credits: courseCredits,
                semester: courseSemester,
                status: courseStatus,
                score: courseScore,
                grade: gradeInfo.grade,
                gradeText: gradeInfo.gradeText,
                gpaValue: gradeInfo.gpaValue
            };
            
            // Save to local storage
            const courses = JSON.parse(localStorage.getItem('courses')) || [];
            courses.push(newCourse);
            localStorage.setItem('courses', JSON.stringify(courses));
            
            // Add to UI
            addCourseToUI(newCourse);
            
            // Close modal and reset form
            addCourseModal.style.display = 'none';
            addCourseForm.reset();
            
            // Update GPA calculation
            updateGPA();
            updateProgress();
            
            // Hide empty state if needed
            if (coursesEmptyState) {
                coursesEmptyState.style.display = 'none';
            }
        });
    }
    
    // Load courses from local storage
    function loadCourses() {
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        const courseList = document.getElementById('course-list');
        const coursesEmptyState = document.getElementById('courses-empty-state');
        
        if (courseList) {
            // Clear existing list
            courseList.innerHTML = '';
            
            if (courses.length === 0) {
                if (coursesEmptyState) {
                    coursesEmptyState.style.display = 'block';
                }
            } else {
                if (coursesEmptyState) {
                    coursesEmptyState.style.display = 'none';
                }
                
                // Add each course to UI
                courses.forEach(course => {
                    addCourseToUI(course);
                });
            }
        }
    }
    
    // Add course to UI
    function addCourseToUI(course) {
        const courseList = document.getElementById('course-list');
        
        if (courseList) {
            const newCourse = document.createElement('li');
            newCourse.className = 'course-item';
            newCourse.dataset.id = course.id;
            
            const courseInfo = document.createElement('div');
            
            const courseTitle = document.createElement('h3');
            courseTitle.textContent = `${course.code} - ${course.name}`;
            courseInfo.appendChild(courseTitle);
            
            const courseDetails = document.createElement('p');
            courseDetails.textContent = `Credits: ${course.credits} | Status: ${course.status === 'completed' ? 'Completed' : course.status === 'in-progress' ? 'In Progress' : 'Planned'}`;
            courseInfo.appendChild(courseDetails);
            
            if (course.status === 'completed' && course.score) {
                const courseGradeElem = document.createElement('p');
                courseGradeElem.textContent = `Score: ${course.score}% | Grade: ${course.grade} | GPA: ${course.gpaValue}`;
                courseInfo.appendChild(courseGradeElem);
            } else if (course.score) {
                const courseScoreElem = document.createElement('p');
                courseScoreElem.textContent = `Score: ${course.score}%`;
                courseInfo.appendChild(courseScoreElem);
            }
            
            const courseActions = document.createElement('div');
            courseActions.className = 'course-actions';
            
            const editButton = document.createElement('button');
            editButton.className = 'btn-edit';
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', function() {
                editCourse(course.id);
            });
            courseActions.appendChild(editButton);
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn-delete';
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', function() {
                deleteCourse(course.id);
            });
            courseActions.appendChild(deleteButton);
            
            newCourse.appendChild(courseInfo);
            newCourse.appendChild(courseActions);
            
            courseList.appendChild(newCourse);
        }
    }
    
    // Edit course
    function editCourse(courseId) {
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        const course = courses.find(c => c.id === courseId);
        
        if (course && editCourseModal) {
            // Fill form with course data
            document.getElementById('edit-course-id').value = course.id;
            document.getElementById('edit-course-code').value = course.code;
            document.getElementById('edit-course-name').value = course.name;
            document.getElementById('edit-course-credits').value = course.credits;
            
            // Update semester dropdown
            updateSemesterDropdown('edit-course-semester');
            document.getElementById('edit-course-semester').value = course.semester;
            
            document.getElementById('edit-course-status').value = course.status;
            document.getElementById('edit-course-score').value = course.score || '';
            
            // Show modal
            editCourseModal.style.display = 'block';
        }
    }
    
    // Edit course form submit
    const editCourseForm = document.getElementById('edit-course-form');
    
    if (editCourseForm) {
        editCourseForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const courseId = document.getElementById('edit-course-id').value;
            const courseCode = document.getElementById('edit-course-code').value;
            const courseName = document.getElementById('edit-course-name').value;
            const courseCredits = parseInt(document.getElementById('edit-course-credits').value);
            const courseSemester = document.getElementById('edit-course-semester').value;
            const courseStatus = document.getElementById('edit-course-status').value;
            const courseScore = document.getElementById('edit-course-score').value;
            
            let gradeInfo = { grade: '', gradeText: '', gpaValue: 0 };
            
            if (courseStatus === 'completed' && courseScore) {
                gradeInfo = calculateGradeFromScore(courseScore);
            }
            
            // Update course in local storage
            const courses = JSON.parse(localStorage.getItem('courses')) || [];
            const courseIndex = courses.findIndex(c => c.id === courseId);
            
            if (courseIndex !== -1) {
                courses[courseIndex] = {
                    ...courses[courseIndex],
                    code: courseCode,
                    name: courseName,
                    credits: courseCredits,
                    semester: courseSemester,
                    status: courseStatus,
                    score: courseScore,
                    grade: gradeInfo.grade,
                    gradeText: gradeInfo.gradeText,
                    gpaValue: gradeInfo.gpaValue
                };
                
                localStorage.setItem('courses', JSON.stringify(courses));
                
                // Reload courses to update UI
                loadCourses();
                
                // Update GPA calculation
                updateGPA();
                updateProgress();
                
                // Close modal
                editCourseModal.style.display = 'none';
            }
        });
    }
    
    // Delete course
    function deleteCourse(courseId) {
        // Remove from local storage
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        const updatedCourses = courses.filter(course => course.id !== courseId);
        localStorage.setItem('courses', JSON.stringify(updatedCourses));
        
        // Remove from UI
        const courseItem = document.querySelector(`.course-item[data-id="${courseId}"]`);
        if (courseItem) {
            courseItem.remove();
        }
        
        // Show empty state if needed
        const courseList = document.getElementById('course-list');
        const coursesEmptyState = document.getElementById('courses-empty-state');
        
        if (courseList && coursesEmptyState && courseList.children.length === 0) {
            coursesEmptyState.style.display = 'block';
        }
        
        // Update GPA and progress
        updateGPA();
        updateProgress();
    }
    
    // Update semester dropdown in add course modal
    function updateSemesterDropdown(selectId = 'course-semester') {
        const semesterSelect = document.getElementById(selectId);
        const semesters = JSON.parse(localStorage.getItem('semesters')) || [];
        
        if (semesterSelect) {
            // Clear existing options except the first one
            while (semesterSelect.options.length > 1) {
                semesterSelect.remove(1);
            }
            
            // Add semesters as options
            semesters.forEach(semester => {
                const option = document.createElement('option');
                option.value = semester.id;
                option.textContent = `${semester.year} ${semester.term}`;
                semesterSelect.appendChild(option);
            });
        }
    }
    
    // Add new semester
    const addSemesterForm = document.getElementById('add-semester-form');
    const semesterAccordion = document.querySelector('.semester-accordion');
    const semestersEmptyState = document.getElementById('semesters-empty-state');
    
    if (addSemesterForm && semesterAccordion) {
        addSemesterForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const semesterYear = document.getElementById('semester-year').value;
            const semesterTerm = document.getElementById('semester-term').value;
            const semesterCreditsPlan = document.getElementById('semester-credits-plan').value;
            
            // Create new semester object
            const newSemester = {
                id: Date.now().toString(),
                year: semesterYear,
                term: semesterTerm,
                creditsPlan: semesterCreditsPlan,
                courses: []
            };
            
            // Save to local storage
            const semesters = JSON.parse(localStorage.getItem('semesters')) || [];
            semesters.push(newSemester);
            localStorage.setItem('semesters', JSON.stringify(semesters));
            
            // Add to UI
            addSemesterToUI(newSemester);
            
            // Close modal and reset form
            addSemesterModal.style.display = 'none';
            addSemesterForm.reset();
            
            // Hide empty state if needed
            if (semestersEmptyState) {
                semestersEmptyState.style.display = 'none';
            }
        });
    }
    
    // Load semesters from local storage
    function loadSemesters() {
        const semesters = JSON.parse(localStorage.getItem('semesters')) || [];
        const semesterAccordion = document.querySelector('.semester-accordion');
        const semestersEmptyState = document.getElementById('semesters-empty-state');
        
        if (semesterAccordion) {
            // Clear existing semesters
            semesterAccordion.innerHTML = '';
            
            if (semesters.length === 0) {
                if (semestersEmptyState) {
                    semestersEmptyState.style.display = 'block';
                }
            } else {
                if (semestersEmptyState) {
                    semestersEmptyState.style.display = 'none';
                }
                
                // Add each semester to UI
                semesters.forEach(semester => {
                    addSemesterToUI(semester);
                });
            }
        }
    }
    
    // Edit semester
    function editSemester(semesterId) {
        const semesters = JSON.parse(localStorage.getItem('semesters')) || [];
        const semester = semesters.find(s => s.id === semesterId);
        
        if (semester && editSemesterModal) {
            // Fill form with semester data
            document.getElementById('edit-semester-id').value = semester.id;
            document.getElementById('edit-semester-year').value = semester.year;
            document.getElementById('edit-semester-term').value = semester.term;
            document.getElementById('edit-semester-credits-plan').value = semester.creditsPlan;
            
            // Show modal
            editSemesterModal.style.display = 'block';
        }
    }
    
    // Edit semester form submit
    const editSemesterForm = document.getElementById('edit-semester-form');
    
    if (editSemesterForm) {
        editSemesterForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const semesterId = document.getElementById('edit-semester-id').value;
            const semesterYear = document.getElementById('edit-semester-year').value;
            const semesterTerm = document.getElementById('edit-semester-term').value;
            const semesterCreditsPlan = document.getElementById('edit-semester-credits-plan').value;
            
            // Update semester in local storage
            const semesters = JSON.parse(localStorage.getItem('semesters')) || [];
            const semesterIndex = semesters.findIndex(s => s.id === semesterId);
            
            if (semesterIndex !== -1) {
                semesters[semesterIndex] = {
                    ...semesters[semesterIndex],
                    year: semesterYear,
                    term: semesterTerm,
                    creditsPlan: semesterCreditsPlan
                };
                
                localStorage.setItem('semesters', JSON.stringify(semesters));
                
                // Reload semesters to update UI
                loadSemesters();
                
                // Close modal
                editSemesterModal.style.display = 'none';
            }
        });
    }
    
    // Delete semester
    function deleteSemester(semesterId) {
        // Remove from local storage
        const semesters = JSON.parse(localStorage.getItem('semesters')) || [];
        const updatedSemesters = semesters.filter(semester => semester.id !== semesterId);
        localStorage.setItem('semesters', JSON.stringify(updatedSemesters));
        
        // Reload semesters to update UI
        loadSemesters();
        
        // Show empty state if needed
        if (updatedSemesters.length === 0) {
            const semestersEmptyState = document.getElementById('semesters-empty-state');
            if (semestersEmptyState) {
                semestersEmptyState.style.display = 'block';
            }
        }
    }
    
    // Add semester to UI
    function addSemesterToUI(semester) {
        const semesterAccordion = document.querySelector('.semester-accordion');
        
        if (semesterAccordion) {
            const newSemester = document.createElement('div');
            newSemester.className = 'semester-item';
            newSemester.dataset.id = semester.id;
            
            // Calculate semester stats
            const stats = calculateSemesterStats(semester);
            
            const semesterHeader = document.createElement('div');
            semesterHeader.className = 'semester-header';
            
            const semesterTitle = document.createElement('h3');
            semesterTitle.textContent = `${semester.year} ${semester.term}`;
            
            const semesterSummary = document.createElement('div');
            semesterSummary.className = 'semester-summary';
            semesterSummary.innerHTML = `
                <span>Courses: ${stats.courseCount}</span>
                <span>Credits: ${stats.completedCredits}/${semester.creditsPlan}</span>
                <span>Avg: ${stats.averageScore}</span>
                <span>GPA: ${stats.gpa}</span>
            `;
            
            const semesterToggle = document.createElement('span');
            semesterToggle.className = 'semester-toggle';
            semesterToggle.textContent = '▾';
            
            semesterHeader.appendChild(semesterTitle);
            semesterHeader.appendChild(semesterSummary);
            semesterHeader.appendChild(semesterToggle);
            
            const semesterContent = document.createElement('div');
            semesterContent.className = 'semester-content';
            
            // Add buttons for add, edit, delete
            const semesterActions = document.createElement('div');
            semesterActions.className = 'semester-actions';
            
            const addCourseBtn = document.createElement('button');
            addCourseBtn.className = 'btn-add btn-add-to-semester';
            addCourseBtn.textContent = 'Add Course';
            addCourseBtn.setAttribute('data-semester-id', semester.id);
            addCourseBtn.setAttribute('data-semester-name', `${semester.year} ${semester.term}`);
            
            const editSemesterBtn = document.createElement('button');
            editSemesterBtn.className = 'btn-edit';
            editSemesterBtn.textContent = 'Edit Semester';
            editSemesterBtn.addEventListener('click', function(event) {
                event.stopPropagation();
                editSemester(semester.id);
            });
            
            const deleteSemesterBtn = document.createElement('button');
            deleteSemesterBtn.className = 'btn-delete';
            deleteSemesterBtn.textContent = 'Delete Semester';
            deleteSemesterBtn.addEventListener('click', function(event) {
                event.stopPropagation();
                if (confirm('Are you sure you want to delete this semester?')) {
                    deleteSemester(semester.id);
                }
            });
            
            semesterActions.appendChild(addCourseBtn);
            semesterActions.appendChild(editSemesterBtn);
            semesterActions.appendChild(deleteSemesterBtn);
            
            const semesterTable = document.createElement('table');
            semesterTable.className = 'semester-courses';
            semesterTable.innerHTML = `
                <thead>
                    <tr>
                        <th>CODE</th>
                        <th>NAME</th>
                        <th>CRE</th>
                        <th>SCORE</th>
                        <th>GRADE</th>
                        <th>GPA</th>
                        <th>STAT</th>
                        <th>ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    ${semester.courses && semester.courses.length > 0 ? 
                        semester.courses.map(course => `
                            <tr data-course-id="${course.id}">
                                <td>${course.code}</td>
                                <td>${course.name}</td>
                                <td>${course.credits}</td>
                                <td>${course.score || '-'}</td>
                                <td>${course.grade || '-'}</td>
                                <td>${course.gpaValue || '-'}</td>
                                <td><span class="${course.gpaValue > 0 ? 'status-completed' : 'status-failed'}"></span></td>
                                <td>
                                    <button class="btn-edit btn-sm" onclick="editSemesterCourse('${semester.id}', '${course.id}')">Edit</button>
                                    <button class="btn-delete btn-sm" onclick="deleteSemesterCourse('${semester.id}', '${course.id}')">Delete</button>
                                </td>
                            </tr>
                        `).join('') : 
                        '<tr><td colspan="8" style="text-align: center; padding: 20px;">No courses added yet</td></tr>'
                    }
                </tbody>
            `;
            
            semesterContent.appendChild(semesterTable);
            semesterContent.appendChild(semesterActions);
            
            newSemester.appendChild(semesterHeader);
            newSemester.appendChild(semesterContent);
            
            semesterAccordion.appendChild(newSemester);
            
            // Add toggle functionality
            semesterHeader.addEventListener('click', function() {
                this.nextElementSibling.classList.toggle('active');
                const toggleIcon = this.querySelector('.semester-toggle');
                toggleIcon.textContent = toggleIcon.textContent === '▾' ? '▴' : '▾';
            });
            
            // Add course to semester button
            addCourseBtn.addEventListener('click', function(event) {
                event.stopPropagation();
                const semesterId = this.getAttribute('data-semester-id');
                const semesterName = this.getAttribute('data-semester-name');
                
                const modal = document.getElementById('add-course-to-semester-modal');
                const semesterIdField = document.getElementById('semester-id');
                const semesterNameSpan = document.getElementById('semester-name');
                
                if (modal && semesterIdField && semesterNameSpan) {
                    semesterIdField.value = semesterId;
                    semesterNameSpan.textContent = semesterName;
                    modal.style.display = 'block';
                }
            });
        }
    }
    
    // Add course to semester
    const addCourseToSemesterForm = document.getElementById('add-course-to-semester-form');
    const addCourseToSemesterModal = document.getElementById('add-course-to-semester-modal');
    
    if (addCourseToSemesterForm && addCourseToSemesterModal) {
        addCourseToSemesterForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const semesterId = document.getElementById('semester-id').value;
            const courseCode = document.getElementById('semester-course-code').value;
            const courseName = document.getElementById('semester-course-name').value;
            const courseCredits = parseInt(document.getElementById('semester-course-credits').value);
            const courseScore = document.getElementById('semester-course-score').value;
            
            let gradeInfo = { grade: '', gradeText: '', gpaValue: 0 };
            
            if (courseScore) {
                gradeInfo = calculateGradeFromScore(courseScore);
            }
            
            // Create new course object
            const newCourse = {
                id: Date.now().toString(),
                code: courseCode,
                name: courseName,
                credits: courseCredits,
                score: courseScore,
                grade: gradeInfo.grade,
                gradeText: gradeInfo.gradeText,
                gpaValue: gradeInfo.gpaValue
            };
            
            // Add to semester in local storage
            const semesters = JSON.parse(localStorage.getItem('semesters')) || [];
            const semesterIndex = semesters.findIndex(s => s.id === semesterId);
            
            if (semesterIndex !== -1) {
                if (!semesters[semesterIndex].courses) {
                    semesters[semesterIndex].courses = [];
                }
                
                semesters[semesterIndex].courses.push(newCourse);
                localStorage.setItem('semesters', JSON.stringify(semesters));
                
                // Reload semesters to update UI
                loadSemesters();
                
                // Close modal and reset form
                addCourseToSemesterModal.style.display = 'none';
                addCourseToSemesterForm.reset();
            }
        });
    }
    
    // Edit semester course
    window.editSemesterCourse = function(semesterId, courseId) {
        const semesters = JSON.parse(localStorage.getItem('semesters')) || [];
        const semesterIndex = semesters.findIndex(s => s.id === semesterId);
        
        if (semesterIndex !== -1 && semesters[semesterIndex].courses) {
            const courseIndex = semesters[semesterIndex].courses.findIndex(c => c.id === courseId);
            
            if (courseIndex !== -1) {
                const course = semesters[semesterIndex].courses[courseIndex];
                
                // Fill edit modal with course data
                document.getElementById('edit-semester-course-id').value = courseId;
                document.getElementById('edit-semester-course-semester-id').value = semesterId;
                document.getElementById('edit-semester-course-code').value = course.code;
                document.getElementById('edit-semester-course-name').value = course.name;
                document.getElementById('edit-semester-course-credits').value = course.credits;
                document.getElementById('edit-semester-course-score').value = course.score || '';
                
                // Show edit modal
                document.getElementById('edit-course-in-semester-modal').style.display = 'block';
            }
        }
    };
    
    // Delete semester course
    window.deleteSemesterCourse = function(semesterId, courseId) {
        if (confirm('Are you sure you want to delete this course?')) {
            const semesters = JSON.parse(localStorage.getItem('semesters')) || [];
            const semesterIndex = semesters.findIndex(s => s.id === semesterId);
            
            if (semesterIndex !== -1 && semesters[semesterIndex].courses) {
                semesters[semesterIndex].courses = semesters[semesterIndex].courses.filter(c => c.id !== courseId);
                localStorage.setItem('semesters', JSON.stringify(semesters));
                
                // Reload semesters to update UI
                loadSemesters();
            }
        }
    };
    
    // Edit semester course form
    const editCourseInSemesterForm = document.getElementById('edit-course-in-semester-form');
    
    if (editCourseInSemesterForm) {
        editCourseInSemesterForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const courseId = document.getElementById('edit-semester-course-id').value;
            const semesterId = document.getElementById('edit-semester-course-semester-id').value;
            const courseCode = document.getElementById('edit-semester-course-code').value;
            const courseName = document.getElementById('edit-semester-course-name').value;
            const courseCredits = parseInt(document.getElementById('edit-semester-course-credits').value);
            const courseScore = document.getElementById('edit-semester-course-score').value;
            
            let gradeInfo = { grade: '', gradeText: '', gpaValue: 0 };
            
            if (courseScore) {
                gradeInfo = calculateGradeFromScore(courseScore);
            }
            
            // Update course in semester
            const semesters = JSON.parse(localStorage.getItem('semesters')) || [];
            const semesterIndex = semesters.findIndex(s => s.id === semesterId);
            
            if (semesterIndex !== -1 && semesters[semesterIndex].courses) {
                const courseIndex = semesters[semesterIndex].courses.findIndex(c => c.id === courseId);
                
                if (courseIndex !== -1) {
                    semesters[semesterIndex].courses[courseIndex] = {
                        ...semesters[semesterIndex].courses[courseIndex],
                        code: courseCode,
                        name: courseName,
                        credits: courseCredits,
                        score: courseScore,
                        grade: gradeInfo.grade,
                        gradeText: gradeInfo.gradeText,
                        gpaValue: gradeInfo.gpaValue
                    };
                    
                    localStorage.setItem('semesters', JSON.stringify(semesters));
                    
                    // Reload semesters to update UI
                    loadSemesters();
                    
                    // Close modal
                    document.getElementById('edit-course-in-semester-modal').style.display = 'none';
                }
            }
        });
    }
    
    // Calculate semester statistics
    function calculateSemesterStats(semester) {
        const stats = {
            courseCount: semester.courses ? semester.courses.length : 0,
            totalCredits: 0,
            completedCredits: 0,
            totalScore: 0,
            totalGradePoints: 0,
            averageScore: 0,
            gpa: 0
        };
        
        if (!semester.courses || semester.courses.length === 0) {
            return stats;
        }
        
        // Calculate stats
        semester.courses.forEach(course => {
            stats.totalCredits += course.credits;
            stats.completedCredits += course.credits;
            
            if (course.score) {
                stats.totalScore += parseFloat(course.score);
            }
            
            if (course.gpaValue !== undefined) {
                stats.totalGradePoints += parseFloat(course.gpaValue) * course.credits;
            }
        });
        
        stats.averageScore = stats.courseCount > 0 ? Math.round(stats.totalScore / stats.courseCount) : 0;
        stats.gpa = stats.totalCredits > 0 ? Math.round(stats.totalGradePoints / stats.totalCredits) : 0;
        
        return stats;
    }
    
    // Update GPA calculation
    function updateGPA() {
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        const gpaDisplay = document.querySelector('.gpa-value');
        const gpaResult = document.getElementById('gpa-result');
        const totalCreditsElem = document.getElementById('total-credits');
        const gpaCoursesBody = document.getElementById('gpa-courses-body');
        const gpaEmptyState = document.getElementById('gpa-empty-state');
        
        // Filter completed courses with grades
        const completedCourses = courses.filter(course => course.status === 'completed' && course.score);
        
        if (completedCourses.length === 0) {
            if (gpaDisplay) gpaDisplay.textContent = '0';
            if (gpaResult) gpaResult.textContent = '0';
            if (totalCreditsElem) totalCreditsElem.textContent = '0';
            if (gpaCoursesBody) gpaCoursesBody.innerHTML = '';
            if (gpaEmptyState) gpaEmptyState.style.display = 'block';
            
            // Update profile GPA display
            //document.querySelector('.info-column:nth-child(4) .info-value').textContent = '0';
            //document.querySelector('.info-column:nth-child(5) .info-value').textContent = '0';
            
            return;
        }
        
        if (gpaEmptyState) gpaEmptyState.style.display = 'none';
        
        let totalCredits = 0;
        let totalPoints = 0;
        let totalScore = 0;
        
        // Calculate total
        completedCourses.forEach(course => {
            const credits = parseInt(course.credits);
            const gpaValue = parseInt(course.gpaValue || 0);
            const points = credits * gpaValue;
            
            totalCredits += credits;
            totalPoints += points;
            
            if (course.score) {
                totalScore += parseFloat(course.score);
            }
        });
        
        // Calculate GPA (whole numbers only)
        const gpa = totalCredits > 0 ? Math.round(totalPoints / totalCredits) : 0;
        const averageScore = completedCourses.length > 0 ? Math.round(totalScore / completedCourses.length) : 0;
        
        // Update UI
        if (gpaDisplay) gpaDisplay.textContent = gpa;
        if (gpaResult) gpaResult.textContent = gpa;
        if (totalCreditsElem) totalCreditsElem.textContent = totalCredits.toString();
        
        // Update GPA table
        if (gpaCoursesBody) {
            gpaCoursesBody.innerHTML = '';
            
            completedCourses.forEach(course => {
                const credits = parseInt(course.credits);
                const gpaValue = parseInt(course.gpaValue || 0);
                const points = credits * gpaValue;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${course.code}</td>
                    <td>${credits}</td>
                    <td>${course.grade} (${course.gpaValue})</td>
                    <td>${points}</td>
                `;
                
                gpaCoursesBody.appendChild(row);
            });
        }
    }
    
    // Update progress bar and credits
    function updateProgress() {
        const profile = JSON.parse(localStorage.getItem('studentProfile')) || {};
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        const totalCreditsRequired = profile.totalCreditsRequired || 120;
        
        // Calculate completed credits
        let completedCredits = 0;
        courses.forEach(course => {
            if (course.status === 'completed') {
                completedCredits += parseInt(course.credits);
            }
        });
        
        // Update progress bar
        const progressBar = document.querySelector('.progress');
        const progressPercent = totalCreditsRequired > 0 ? Math.round((completedCredits / totalCreditsRequired) * 100) : 0;
        
        if (progressBar) {
            progressBar.style.width = `${progressPercent}%`;
            progressBar.textContent = `${progressPercent}%`;
        }
        
        // Update credits text
        const creditsText = document.querySelector('#dashboard p:nth-of-type(3)');
        if (creditsText) {
            creditsText.textContent = `Credits: ${completedCredits}/${totalCreditsRequired}`;
        }
        
        // Update GPA text
        const gpaText = document.querySelector('#dashboard p:nth-of-type(4)');
        if (gpaText) {
            const gpa = document.querySelector('.gpa-value')?.textContent || '0';
            gpaText.textContent = `Current GPA: ${gpa}/4`;
        }
    }
    
    // Update Profile Form
    const studentProfileForm = document.getElementById('student-profile-form');
    if (studentProfileForm) {
        studentProfileForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Get profile values
            const profile = {
                name: document.getElementById('student-name').value,
                id: document.getElementById('student-id').value,
                major: document.getElementById('student-major').value,
                degree: document.getElementById('student-degree').value,
                year: document.getElementById('student-year').value,
                graduation: document.getElementById('student-graduation').value,
                totalCreditsRequired: document.getElementById('total-credits-required').value
            };
            
            // Save to local storage
            localStorage.setItem('studentProfile', JSON.stringify(profile));
            
            // Update profile display
            updateProfileDisplay(profile);
            
            // Update progress
            updateProgress();
            
            alert('Profile updated successfully!');
        });
    }
});
