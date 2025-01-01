// Smooth scrolling
document.querySelectorAll('nav a').forEach((anchor, index) => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        // Update current section index when clicking
        currentSectionIndex = index;

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Static list of sections for easier navigation
const sectionIds = ['about', 'projects', 'skills', 'contact'];
let currentSectionIndex = 0;
const navLinks = document.querySelectorAll('nav a');

// Function to update active nav link
function updateActiveLink(index) {
    if (index < 0 || index >= navLinks.length) return;  // Guard clause
    navLinks.forEach(link => link.classList.remove('active'));
    navLinks[index].classList.add('active');
}

window.addEventListener('scroll', () => {
    // Calculate which section is currently in view
    const sections = document.querySelectorAll('.section');
    let newIndex = 0;

    sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight/2 && rect.bottom >= window.innerHeight/2) {
            newIndex = index;
        }
    });

    // Only update if the section has changed
    if (currentSectionIndex !== newIndex) {
        currentSectionIndex = newIndex;
        updateActiveLink(currentSectionIndex);
    }
});

// // Scroll to next/previous section on mouse wheel
// let isScrolling = false;
// window.addEventListener('wheel', (event) => {
//     if (isScrolling) return;
//     isScrolling = true;

//     const direction = event.deltaY > 0 ? 1 : -1;

//     // Update current section index
//     if (direction === 1) {
//         currentSectionIndex = Math.min(currentSectionIndex + 1, sectionIds.length - 1);
//     } else {
//         currentSectionIndex = Math.max(currentSectionIndex - 1, 0);
//     }

//     // Update active nav link
//     updateActiveLink(currentSectionIndex);

//     // Scroll to the section
//     document.getElementById(sectionIds[currentSectionIndex]).scrollIntoView({
//         behavior: 'smooth'
//     });
// });

// // Listen for the end of scrolling
// document.addEventListener('scrollend', () => {
//     isScrolling = false;
// });

// Initialize active link
updateActiveLink(0);

// Console animation
async function typeText(element, text, speed = 50) {
    element.classList.add('cursor');
    for (let char of text) {
        element.textContent += char;
        await new Promise(resolve => setTimeout(resolve, speed));
    }
    element.classList.remove('cursor');
}

async function animateConsole() {
    const lines = document.querySelectorAll('.console-line');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (i === 0) {
            line.style.opacity = 1;
        }
        line.style.opacity = 1;
        const prompt = line.querySelector('.console-prompt');
        const output = line.querySelector('.console-output');
        
        if (i === lines.length - 1) {
            // For the last line, just show the cursor
            output.classList.add('cursor');
        } else if (prompt && output) {
            // If it's a command line
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second before showing prompt
            await typeText(output, output.getAttribute('data-text') || '');
        } else if (output) {
            // If it's output only
            output.style.opacity = 1;
        }
    }
}

// Start animation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(animateConsole, 1000); // 1 second delay before starting animation
});

// Skill terminal functionality
const skillData = {
    android: {
        name: 'Android Development',
        description: 
`Proficiency Level: Expert

Key Competencies:
- Native Android Development (Java/Kotlin)
- Android SDK & Android Jetpack
- MVVM Architecture
- Custom Views & Animations
- Background Processing & Services
- Hardware Integration (Camera, Sensors)
- Network Operations & REST APIs
- SQLite & Room Database

Recent Projects:
- PhantomDroid - Remote Access Tool
- Custom Camera Applications
- Real-time Communication Apps
- Background Service Implementations`,
    },
    flutter: {
        name: 'Flutter Development',
        description:
`Proficiency Level: Advanced

Key Competencies:
- Cross-platform Development
- Custom Widget Development
- State Management (Provider, Bloc)
- Platform Channels
- Custom Animations
- Firebase Integration
- RESTful API Integration
- Local Storage Solutions

Recent Projects:
- Flutter Runner Game
- Custom Flutter Plugins
- Cross-platform Applications
- UI Component Libraries`,
    },
    java: {
        name: 'Java',
        description:
`Proficiency Level: Expert

Key Competencies:
- Object-Oriented Programming
- Design Patterns
- Multithreading & Concurrency
- Network Programming
- File I/O & Streams
- Collections Framework
- JNI & Native Code Integration

Applications:
- Android Development
- Desktop Applications
- Server-side Development
- System Programming`,
    },
    kotlin: {
        name: 'Kotlin',
        description:
`Proficiency Level: Advanced

Key Competencies:
- Kotlin Coroutines
- Extension Functions
- Null Safety Features
- Higher-Order Functions
- Data Classes & Sealed Classes
- Flow & Channel APIs
- Android KTX

Applications:
- Modern Android Development
- Multiplatform Projects
- DSL Creation
- Server-side Development`,
    },
    dart: {
        name: 'Dart',
        description:
`Proficiency Level: Advanced

Key Competencies:
- Asynchronous Programming
- Stream Processing
- Object-Oriented Features
- Generics & Collections
- Isolates for Concurrency
- Package Development
- FFI Integration

Applications:
- Flutter Development
- Command-line Tools
- Web Applications
- Package Creation`,
    },
};

function initializeSkillTerminal() {
    const skillItems = document.querySelectorAll('.skill-item');
    const terminal = document.querySelector('.skill-terminal');
    const output = terminal.querySelector('.skill-output');
    const currentCommand = terminal.querySelector('.current-command');
    let isTyping = false;

    async function typeText(text, element, speed = 10) {
        let index = 0;
        element.textContent = '';
        
        while (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            await new Promise(resolve => setTimeout(resolve, speed));
        }
    }

    async function executeSkillCommand(skillId) {
        if (isTyping) return;
        isTyping = true;

        const skill = skillData[skillId];
        const command = `skill info ${skill.name}`;
        
        // Type the command
        await typeText(command, currentCommand);
        
        // Clear previous output
        output.textContent = '';
        
        // Add small delay before showing output
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Type the skill description
        await typeText(skill.description, output, 5);
        
        isTyping = false;
    }

    skillItems.forEach(item => {
        item.addEventListener('click', () => {
            const skillId = item.dataset.skill;
            executeSkillCommand(skillId);
        });
    });
}

// Initialize skill terminal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeSkillTerminal();
});

// Add interactive glow effect
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.contact-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / card.clientWidth) * 100;
            const y = ((e.clientY - rect.top) / card.clientHeight) * 100;
            
            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        });
    });
});