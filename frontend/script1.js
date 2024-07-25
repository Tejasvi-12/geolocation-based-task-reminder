document.addEventListener('DOMContentLoaded', () => {
    // Select elements
    const addTaskButton = document.querySelector('.add-task');
    const taskList = document.querySelector('.task-list ul');
    const menuItems = document.querySelectorAll('.task-item, .list-item:not(.add-list), .settings-item');
    const headerTitle = document.querySelector('.header h1');
    const modal = document.getElementById('taskModal');
    const span = document.getElementsByClassName('close')[0];
    const taskForm = document.getElementById('taskForm');
    const calendarEl = document.getElementById('calendar');
    const contextMenu = document.getElementById('contextMenu');
    const taskLocation = document.getElementById('taskLocation');
    const taskLocationLabel = document.querySelector('label[for="taskLocation"]');
    const taskTime = document.getElementById('taskTime');
    const taskTimeLabel = document.querySelector('label[for="taskTime"]');
    const taskDate = document.getElementById('taskDate');
    const taskDateLabel = document.querySelector('label[for="taskDate"]');
    const audio = new Audio('Digital-notification-sound.mp3'); // Ensure the path is correct
    const taskCounts = {
        'all-tasks': document.getElementById('all-tasks-count'),
        'today-tasks': document.getElementById('today-tasks-count'),
        'personal-tasks': document.getElementById('personal-tasks-count'),
        'work-tasks': document.getElementById('work-tasks-count'),
        'location-tasks': document.getElementById('location-tasks-count'),
    };

    const addListButton = document.getElementById('add-list-button');
    const newListNameInput = document.getElementById('new-list-name');
    const listContainer = document.getElementById('list-container');
    const listContextMenu = document.getElementById('listContextMenu');
    const deleteListMenuItem = document.getElementById('deleteList');
    const stickyWallContainer = document.getElementById('stickyWallContainer');
    const addStickyNoteButton = document.getElementById('addStickyNoteButton');
    const stickyNotesArea = document.getElementById('stickyNotesArea');
    const signOutLink = document.getElementById("sign-out-link");
    


    document.getElementById('signOutButton').addEventListener('click', function() {
        // Redirect to login page
        window.location.href = 'login.html';
    });
    
    let currentListName = '';
    let calendar;
    let currentTab = 'today-tasks';
    let currentTask;

    // Request notification permission
    if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
            console.log("Notification permission:", permission);
        });
    }

    loadTasks(currentTab);

    addTaskButton.addEventListener('click', () => {
        modal.style.display = 'block';
        if (currentTab === 'location-tasks') {
            taskLocation.style.display = 'block';
            taskLocationLabel.style.display = 'block';
            taskTime.style.display = 'none';
            taskTimeLabel.style.display = 'none';
            taskDate.style.display = 'none';
            taskDateLabel.style.display = 'none';
            taskDate.removeAttribute('required');
            taskTime.removeAttribute('required');
        } else {
            taskLocation.style.display = 'none';
            taskLocationLabel.style.display = 'none';
            taskTime.style.display = 'block';
            taskTimeLabel.style.display = 'block';
            taskDate.style.display = 'block';
            taskDateLabel.style.display = 'block';
            taskDate.setAttribute('required', 'required');
            taskTime.setAttribute('required', 'required');
        }
    });

    span.onclick = () => {
        modal.style.display = 'none';
        taskForm.reset();
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
            taskForm.reset();
        }
        hideContextMenu();
    };

    function createStickyNote(content = '') {
        const stickyNote = document.createElement('div');
        stickyNote.classList.add('sticky-note');
        
        const textarea = document.createElement('textarea');
        textarea.value = content;
        textarea.addEventListener('input', saveStickyNotes);
        stickyNote.appendChild(textarea);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', () => {
            stickyNote.remove();
            saveStickyNotes();
        });
        stickyNote.appendChild(deleteBtn);
        
        stickyNotesArea.appendChild(stickyNote);
        saveStickyNotes();
    }

    function saveStickyNotes() {
        const notes = [];
        document.querySelectorAll('.sticky-note').forEach(note => {
            notes.push(note.querySelector('textarea').value);
        });
        localStorage.setItem('stickyNotes', JSON.stringify(notes));
    }

    function loadStickyNotes() {
        stickyNotesArea.innerHTML = ''; // Clear the sticky notes area before loading
        const notes = JSON.parse(localStorage.getItem('stickyNotes')) || [];
        notes.forEach(note => createStickyNote(note));
    }

    addStickyNoteButton.addEventListener('click', () => {
        createStickyNote();
    });

    // Load sticky notes when the sticky wall is shown
    document.querySelector('[data-content="sticky-wall-tasks"]').addEventListener('click', () => {
        stickyWallContainer.style.display = 'block';
        loadStickyNotes();
        addTaskButton.style.display = 'none';
    });
    
    // Hide sticky wall container when other tabs are clicked
    document.querySelectorAll('.task-item').forEach(item => {
        if (item.getAttribute('data-content') !== 'sticky-wall-tasks') {
            item.addEventListener('click', () => {
                stickyWallContainer.style.display = 'none';
                addTaskButton.style.display = 'block';

            });
        }
    });
    // Show "Add Task" button when other tabs are clicked
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const content = item.getAttribute('data-content');
            headerTitle.textContent = item.textContent.trim();
            if (content !== 'sticky-wall-tasks') {
                addTaskButton.style.display = 'block';
                stickyWallContainer.style.display = 'none';
                loadTasks(content);
            } else {
                stickyWallContainer.style.display = 'block';
                addTaskButton.style.display = 'none';
                loadStickyNotes();
            }
        });
    });
    

    function updateTaskCounts() {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        for (let tab in taskCounts) {
            const count = tasks.filter(task => task.tab === tab || tab === 'all-tasks').length;
            taskCounts[tab].textContent = count;
        }
    }

    function showNotificationBox(task) {
        const notificationBox = document.createElement('div');
        notificationBox.classList.add('notification-box');

        const notificationContent = document.createElement('div');
        notificationContent.innerHTML = `<strong>Task Reminder:</strong> ${task.name} - ${task.description} (${task.date} ${task.time})`;

        const closeButton = document.createElement('span');
        closeButton.classList.add('notification-close');
        closeButton.innerHTML = '&times;';

        closeButton.addEventListener('click', () => {
            notificationBox.classList.add('hidden');
            setTimeout(() => {
                notificationBox.remove();
            }, 300);
        });

        notificationBox.appendChild(notificationContent);
        notificationBox.appendChild(closeButton);

        document.body.appendChild(notificationBox);

        setTimeout(() => {
            notificationBox.classList.add('hidden');
            setTimeout(() => {
                notificationBox.remove();
            }, 300);
        }, 10000);
    }

    function editTask(task) {
        // Populate form with task details
        document.getElementById('taskName').value = task.name;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskDate').value = task.date;
        document.getElementById('taskTime').value = task.time;

        // Set current task variable
        currentTask = task;

        // Display modal for editing
        modal.style.display = 'block';
    }
    

    function deleteTask(task) {
        // Get current tasks from localStorage
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
        // Remove the selected task
        tasks = tasks.filter(t => t.name !== task.name || t.date !== task.date || t.time !== task.time || t.location !== task.location);
    
        // Save updated tasks to localStorage
        localStorage.setItem('tasks', JSON.stringify(tasks));
    
        // Reload tasks
        loadTasks(currentTab);
    }

    function handleContextMenuAction(action) {
        if (currentTask) {
            switch (action) {
                case 'edit':
                    editTask(currentTask);
                    break;
                case 'delete':
                    deleteTask(currentTask);
                    break;
                default:
                    console.log('Unknown action');
            }
        }
    }
    
    // Attach context menu actions
    document.getElementById('editTask').addEventListener('click', () => handleContextMenuAction('edit'));
    document.getElementById('deleteTask').addEventListener('click', () => handleContextMenuAction('delete'));
    function toUTC(date, time) {
        const [year, month, day] = date.split('-').map(Number);
        const [hours, minutes] = time.split(':').map(Number);
        const localDateTime = new Date(year, month - 1, day, hours, minutes);
        return localDateTime.toISOString(); // Returns UTC time in ISO format
    }
    

    function saveTask(task) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateTaskCounts();
    }

    function loadTasks(tab) {
        taskList.innerHTML = '';
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.filter(task => task.tab === tab || tab === 'all-tasks');

        if (tab === 'all-tasks') {
            const todayTasks = [];
            const tomorrowTasks = [];
            const weekTasks = [];
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const weekEnd = new Date(today);
            weekEnd.setDate(weekEnd.getDate() + 7);

            tasks.forEach(task => {
                const taskDate = new Date(task.date);
                if (taskDate.toDateString() === today.toDateString()) {
                    todayTasks.push(task);
                } else if (taskDate.toDateString() === tomorrow.toDateString()) {
                    tomorrowTasks.push(task);
                } else if (taskDate <= weekEnd) {
                    weekTasks.push(task);
                }
            });

            displayTaskSection('Today', todayTasks);
            displayTaskSection('Tomorrow', tomorrowTasks);
            displayTaskSection('This Week', weekTasks);
        } else {
            tasks.forEach(task => displayTask(task));
        }
        updateTaskCounts();
    }
    function displayTaskSection(title, tasks) {
        if (tasks.length > 0) {
            const sectionTitle = document.createElement('h3');
            sectionTitle.textContent = title;
            taskList.appendChild(sectionTitle);
            tasks.forEach(task => displayTask(task));
        }
    }
    function fromUTC(utcDateTime) {
        const localDateTime = new Date(utcDateTime);
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Kolkata',
        };
        return localDateTime.toLocaleString('en-GB', options); // Format the date and time
    }
    


    function displayTask(task) {
        const taskItem = document.createElement('li');
        taskItem.classList.add('task-item');

        const colorDot = document.createElement('div');
        colorDot.classList.add('task-color-dot');
        colorDot.style.backgroundColor = getTaskColor(task.tab);
        taskItem.appendChild(colorDot);

        const taskContent = document.createElement('div');
        taskContent.innerHTML = `<strong>${task.name}</strong><br>${task.description}<br>${task.date} ${task.time}`;
        if (task.tab === 'location-tasks' && task.location) {
            taskContent.innerHTML += `<br>${task.location}`;
        }
        taskItem.appendChild(taskContent);

        taskList.appendChild(taskItem);

        taskItem.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            currentTask = task;
            contextMenu.style.display = 'block';
            contextMenu.style.left = `${event.pageX}px`;
            contextMenu.style.top = `${event.pageY}px`;
        });
    }

    function hideContextMenu() {
        contextMenu.style.display = 'none';
    }

    document.addEventListener('click', (event) => {
        if (!contextMenu.contains(event.target) && !event.target.classList.contains('task-item')) {
            hideContextMenu();
        }
    });

    function showCalendar() {
        console.log('Showing calendar');
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        console.log('Tasks:', tasks);

        if (!calendar) {
            calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                events: tasks.map(task => ({
                    title: task.name,
                    start: task.date + 'T' + task.time,
                    description: task.description,
                    color: getTaskColor(task.tab)
                }))
            });
            calendar.render();
        }
    }

    function getTaskColor(tab) {
        switch(tab) {
            case 'personal-tasks': return 'blue';
            case 'work-tasks': return 'green';
            case 'location-tasks': return 'red';
            case 'calendar-tasks': return 'purple';
            default: return 'gray';
        }
    }

    // Trigger calendar display
    document.querySelector('[data-content="calendar-tasks"]').addEventListener('click', showCalendar);

    function updateContent(tab) {
        loadTasks(tab);
        if (tab === 'calendar-tasks') {
            calendarEl.style.display = 'block';
            showCalendar();
        } else {
            calendarEl.style.display = 'none';
        }
    }

    function toggleAddTaskButton(tab) {
        addTaskButton.style.display = tab === 'calendar-tasks' ? 'none' : 'block';
    }
    
    function scheduleReminder(task) {
        const now = new Date();
        const taskDateTime = new Date(task.date + 'T' + task.time);
    
        console.log(`Current time: ${now}`);
        console.log(`Task time: ${taskDateTime}`);
    
        const timeDifference = taskDateTime - now;
    
        if (timeDifference > 0) {
            console.log(`Scheduling notification in ${timeDifference} milliseconds`);
    
            setTimeout(() => {
                if (task.tab === 'location-tasks' && task.location) {
                    const [latitude, longitude] = task.location.split(',').map(Number);
    
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(position => {
                            const userLat = position.coords.latitude;
                            const userLong = position.coords.longitude;
                            const distance = calculateDistance(userLat, userLong, latitude, longitude);
    
                            console.log(`User Location: (${userLat}, ${userLong})`);
                            console.log(`Task Location: (${latitude}, ${longitude})`);
                            console.log(`Distance: ${distance} km`);
    
                            if (distance < 0.1) { // If within 100 meters
                                playNotification(task);
                            } else {
                                console.log("User is not within the required distance.");
                            }
                        }, error => {
                            console.error("Geolocation error: ", error);
                        });
                    } else {
                        console.log('Geolocation is not supported by this browser.');
                    }
                } else {
                    playNotification(task);
                }
            }, timeDifference);
        } else {
            console.log('Task time is in the past.');
            playNotification(task); // Trigger immediately if the time has already passed
        }
    }
    
    function playNotification(task) {
        if (Notification.permission === "granted") {
            new Notification("Task Reminder", {
                body: `Reminder: ${task.name}`,
                icon: 'icon.png' // Ensure this path is correct
            });
            audio.play(); // Play sound
        } else {
            console.log("Notifications are disabled.");
        }
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    }

    // Event listeners for menu items
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const content = item.getAttribute('data-content');
            currentTab = content;
            updateContent(content);
            headerTitle.textContent = item.textContent;
            toggleAddTaskButton(content);
            if (content === 'calendar-tasks') {
                showCalendar();
            } else {
                calendarEl.style.display = 'none';
            }
        });
    });

    // Form submission
    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const taskName = document.getElementById('taskName').value;
        const taskDescription = document.getElementById('taskDescription').value;
        const taskDateValue = currentTab === 'location-tasks' ? '' : document.getElementById('taskDate').value;
        const taskTimeValue = currentTab === 'location-tasks' ? '' : document.getElementById('taskTime').value;
        const task = {
            name: taskName,
            description: taskDescription,
            date: taskDateValue,
            time: taskTimeValue,
            tab: currentTab
        };
    
        if (currentTab === 'location-tasks') {
            task.location = taskLocation.value;
        }
    
        saveTask(task);
        displayTask(task);
        scheduleReminder(task);
        showNotificationBox(task);
        modal.style.display = 'none';
        taskForm.reset();
        updateTaskCounts();
    });

    // Add new list functionality
    addListButton.addEventListener('click', () => {
        const newListName = newListNameInput.value.trim();
        if (newListName) {
            const newListItem = document.createElement('li');
            newListItem.classList.add('list-item');
            newListItem.textContent = newListName;
            newListItem.setAttribute('data-content', newListName.toLowerCase().replace(/\s+/g, '-'));
            newListItem.addEventListener('click', () => {
                currentTab = newListItem.getAttribute('data-content');
                updateContent(currentTab);
                headerTitle.textContent = newListItem.textContent;
                toggleAddTaskButton(currentTab);
            });
            listContainer.appendChild(newListItem);
            newListNameInput.value = '';
        } else {
            alert('Please enter a list name.');
        }
    });
    

    });