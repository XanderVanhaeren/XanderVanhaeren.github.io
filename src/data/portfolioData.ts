import type {
  AboutData,
  GlassOpticsSettings,
  HeroFieldnotes,
  PersonalInfo,
  PortfolioData,
  ProjectItem,
  ProofOfWorkItem,
  TyphoonArticleData,
} from '../types/portfolio';

export const DEFAULT_GLASS_OPTICS: GlassOpticsSettings = {
  blur: 14,
  bend: 1.6,
  dispersion: 0.6,
  pauseContours: false,
};

export const PERSONAL_DATA: PersonalInfo = {
  name: 'Xander Vanhaeren',
  title: 'Engineering Sciences Student · Aerospace & Embedded Systems',
  description:
    'Designing things that move, sense, and fly — combining SolidWorks CFD aerodynamics, lightweight 3D-printed airframes, and custom ESP32 avionics at KU Leuven.',
  location: 'Leuven, Belgium',
  eyebrow: 'Leuven, Belgium · 50.88° N, 4.70° E',
  coordinates: '50.88° N, 4.70° E',
  footerCopyright: '© 2026 Xander Vanhaeren · Built in Leuven, Belgium',
  footerCoords: '50.8798° N, 4.7005° E · KU Leuven Engineering Sciences',
};

export const HERO_FIELDNOTES: HeroFieldnotes = {
  title: 'Flight & Lab Telemetry',
  coord: 'ISO // 1013.25 hPa',
  rows: [
    {
      label: 'Discipline',
      value: 'B.Sc. Engineering Sciences · KU Leuven',
    },
    {
      label: 'Primary Focus',
      value: 'Aerodynamics, Flight Dynamics & Control',
    },
    {
      label: 'Flagship Airframe',
      value: 'Project Typhoon V3 · 821 g',
    },
    {
      label: 'Avionics Stack',
      value: 'ESP32-C6 · BNO085 · BMP390',
    },
  ],
};

export const ABOUT_DATA: AboutData = {
  kicker: 'Profile & Engineering Loop',
  name: 'About & Engineering Approach',
  subtitle:
    'From aerodynamic equations and CFD meshes to 3D-printed structures and embedded C++ flight control.',
  bio: 'I am an Engineering Sciences student at KU Leuven with a deep focus on aerospace engineering. My work lives at the intersection of aerodynamics, flight dynamics, and embedded control systems — taking ideas from mathematical models and CFD pressure contours all the way to 3D-printed hardware and custom flight controllers.',
  approach: [
    {
      step: '01 // Simulate',
      title: 'Aerodynamics & Mathematical Modeling',
      detail:
        'Airfoil selection (NACA 2412), lift/drag polar calculation, and SolidWorks Flow Simulation mesh validation before cutting or printing a single part.',
    },
    {
      step: '02 // Fabricate',
      title: 'Parametric CAD & Lightweight FDM',
      detail:
        'Thin-wall fuselage and wing architecture in Fusion 360 & SolidWorks, printed in foaming LW-PLA and carbon-reinforced PETG.',
    },
    {
      step: '03 // Control',
      title: 'Custom Avionics & Sensor Fusion',
      detail:
        '4-layer PCBs built around ESP32-C6, BNO085 9-DOF IMU, and BMP390 barometric altimeters running real-time C++ control loops.',
    },
  ],
  education: [
    {
      type: 'Bachelor of Science',
      degree: 'Engineering Sciences (Mechanical Engineering)',
      institution: 'KU Leuven · Leuven, Belgium',
      year: 'Expected 2027',
    },
  ],
  interestsKicker: 'Core Domains',
  interestsTitle: 'Focus Areas & Hardware',
  interests: [
    'Aerodynamics',
    'Flight Dynamics',
    'Control Systems',
    'CFD Simulation',
    '3D Printing (LW-PLA)',
    'Custom PCBs & IoT',
    'Robotics',
  ],
};

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: 'typhoon',
    title: 'Project Typhoon',
    featured: true,
    filterGroup: 'aerospace',
    category: 'Flagship Aerospace Case Study',
    description:
      'Complete aerodynamic design, SolidWorks CFD flow validation, LW-PLA 3D-printed airframe, and custom 4-layer ESP32-C6 flight controller (TARS V2) for an 821 g delta-wing RC jet.',
    specs: [
      { label: 'Airfoil', value: 'NACA 2412' },
      { label: 'Flight Mass', value: '821 g' },
      { label: 'Stall Speed', value: '13.7 m/s' },
      { label: 'Flight Controller', value: 'TARS V2 (ESP32-C6)' },
    ],
    technologies: [
      'SolidWorks CFD',
      'Fusion 360',
      'ESP32-C6 / C++',
      'LW-PLA 3D Printing',
      'Aerodynamics',
    ],
    image: 'assets/images/projects/Typhoon/VelocitySolidworks.png',
    imageWidth: 571,
    imageHeight: 387,
    imageAlt:
      'SolidWorks flow simulation of the Typhoon airframe showing velocity streamlines',
    gallery: [
      {
        src: 'assets/images/projects/Typhoon/typhoon-v3.jpg',
        width: 1400,
        height: 948,
        alt: 'Project Typhoon V3 CAD airframe assembly',
        caption: 'V3 Airframe CAD',
      },
      {
        src: 'assets/images/projects/Typhoon/tars-v2.jpg',
        width: 1200,
        height: 704,
        alt: 'TARS V2 flight controller hardware assembly',
        caption: 'TARS V2 Flight Controller',
      },
    ],
    articleUrl: 'projects/typhoon.html',
  },
  {
    id: 'rcxd',
    title: 'RCXD',
    featured: false,
    filterGroup: 'robotics',
    category: 'Autonomous Robotics',
    description:
      'Compact remote-controlled ground vehicle with onboard obstacle sensing, telemetry link, and autonomous waypoint navigation experiments.',
    specs: [
      { label: 'Platform', value: '4WD Chassis' },
      { label: 'Compute', value: 'Arduino + ROS' },
    ],
    technologies: ['Arduino', 'C++', 'ROS', 'Embedded Sensors'],
    diagram: 'rover',
  },
  {
    id: 'bikeysens',
    title: 'BikeySens',
    featured: false,
    filterGroup: 'telemetry',
    category: 'Embedded Telemetry & Data Analysis',
    description:
      'Smart bicycle instrumentation node capturing real-time cadence, speed, barometric grade, and proximity safety alerts over Bluetooth Low Energy.',
    specs: [
      { label: 'Link', value: 'BLE Telemetry' },
      { label: 'Interface', value: 'Mobile Companion' },
    ],
    technologies: ['Arduino', 'Bluetooth LE', 'Sensor Fusion', 'Mobile App'],
    diagram: 'telemetry',
  },
  {
    id: 'goodnotes-pdf-prep',
    title: 'Goodnotes PDF Prep',
    featured: false,
    filterGroup: 'software',
    category: 'Web Utility & PDF Processing',
    description:
      'Client-side web app for preparing lecture slides and textbooks for Goodnotes by adding configurable note margins, grid paper, borders, and chapter outlines.',
    specs: [
      { label: 'Processing', value: '100% Client-Side' },
      { label: 'Engine', value: 'pdf-lib + PDF.js' },
    ],
    technologies: ['React', 'pdf-lib', 'PDF.js', 'Vite'],
    diagram: 'pdf',
    demoUrl: 'https://xandervanhaeren.github.io/goodnotes-pdf-prep/',
    githubUrl: 'https://github.com/XanderVanhaeren/goodnotes-pdf-prep',
  },
];

export const PROOF_OF_WORK_ITEMS: ProofOfWorkItem[] = [
  {
    id: 'proof-cad-render',
    src: 'assets/images/projects/Typhoon/typhoon-hero-render.png',
    width: 1600,
    height: 1236,
    alt: 'Project Typhoon V3 photo and high-resolution CAD render',
    caption: 'Typhoon V3 photo / CAD render slot',
    slotLabel: 'Typhoon V3 Photo / CAD Render',
  },
  {
    id: 'proof-cfd-contour',
    src: 'assets/images/projects/Typhoon/Fuselage Flowsim.png',
    width: 2559,
    height: 1439,
    alt: 'Project Typhoon CFD longitudinal pressure and velocity contour plot',
    caption: 'CFD / pressure-contour plot slot',
    slotLabel: 'CFD / Pressure-Contour Plot',
  },
];

export const TYPHOON_ARTICLE_DATA: TyphoonArticleData = {
  category: 'Aerodynamics & Flight Control',
  title: 'Project Typhoon',
  subtitle:
    'Designing, simulating, and flight-testing a 3D-printed delta-wing RC jet with a custom ESP32-C6 flight controller to study how airfoil geometry drives maneuverability.',
  tags: [
    'SolidWorks CFD',
    'Fusion 360',
    'ESP32-C6 / C++',
    '3D Printing (PLA / PETG / ASA)',
    'ExpressLRS',
  ],
  heroFigure: {
    src: 'assets/images/projects/Typhoon/typhoon-v3.jpg',
    width: 1400,
    height: 948,
    alt: 'Project Typhoon V3 airframe showing delta wings, twin ducted fans, exposed avionics bay, and metal nose cone',
    caption:
      'Typhoon V3 airframe: open ASA frame around a carbon-fiber main spar, twin 50 mm EDFs, and vase-mode PLA wings.',
  },
  specs: [
    { label: 'Wingspan / Length', value: '680 mm × 602 mm' },
    { label: 'Total Mass', value: '821 g (wings < 60 g each)' },
    { label: 'Airfoil', value: 'NACA 2412 (4° → 2° washout)' },
    { label: 'Propulsion', value: '2 × 50 mm EDF · 12.96 N thrust' },
    { label: 'Thrust-to-Weight', value: '1.61 (1034 W peak)' },
    { label: 'Flight Controller', value: 'TARS V2 (24 g, ESP32-C6 + MPU-6050)' },
  ],
  sections: [
    {
      id: 'research-question-airfoil-selection',
      heading: 'Research Question & Airfoil Selection',
      paragraphs: [
        'Project Typhoon began as my 2025–2026 GSTEMP research project at Don Bosco Haacht, asking: how does airfoil choice affect the maneuverability of a delta-wing aircraft?',
        'Using 2D flight mechanics and polar data from AirfoilTools, I compared three candidate profiles—NACA 2412, NACA 2408, and LS013—on pitch-up angular acceleration at 30 m/s. Because NACA 2412 sustains a higher maximum lift coefficient (cL,max ≈ 1.3 at 12° AoA) than LS013 (cL,max ≈ 1.0 at 10°), it yields a theoretical turn-initiation acceleration of 3.04 rad/s² versus 2.28 rad/s²—a 34% advantage in maneuverability.',
        'In Fusion 360, I built the 0.09575 m² delta wing (aspect ratio 4.83) with geometric washout from 4° at the root to 2° at the tip so stall begins inboard rather than at the wingtips, combined with slight dihedral for roll stability.',
      ],
    },
    {
      id: 'airframe-structural-evolution',
      heading: 'Airframe & Structural Evolution',
      paragraphs: [
        'Inspired by the Eurofighter Typhoon layout, the aircraft combines canards, elevons, and twin rear-mounted 50 mm Electric Ducted Fans (60,800 RPM, 4S 1550 mAh LiPo). Reaching the 821 g flight weight took over five months of structural iteration:',
      ],
      bullets: [
        {
          lead: 'Wings (< 60 g each, rated to 12G):',
          body: 'Carbon-fiber spars carry bending loads through 3D-printed PETG ribs, wrapped in a single-wall vase-mode PLA skin for a smooth surface at minimal weight.',
        },
        {
          lead: 'Open-frame fuselage:',
          body: 'The original streamlined Eurofighter shell starved the EDFs of intake air. Replacing it with an open 3D-printed ASA frame around a central carbon-fiber tube solved intake airflow and made field repairs fast. The wing spars mount beneath the main tube so lift puts the joint in compression.',
        },
      ],
    },
    {
      id: 'cfd-validation-solidworks',
      heading: 'CFD Validation in SolidWorks',
      paragraphs: [
        'Before committing to flight hardware, I ran qualitative flow simulations in SolidWorks Flow Simulation at 30 m/s and 0° angle of attack to check for gross aerodynamic flaws.',
      ],
      gallery: [
        {
          src: 'assets/images/projects/Typhoon/VelocitySolidworks.png',
          width: 571,
          height: 387,
          alt: 'SolidWorks CFD velocity surface render showing high-speed low-pressure regions over the delta wings and canards',
          caption:
            'Surface velocity plot confirming accelerated low-pressure flow over the main wings and canards, plus tip vortices.',
        },
        {
          src: 'assets/images/projects/Typhoon/Fuselage Flowsim.png',
          width: 2559,
          height: 1439,
          alt: 'SolidWorks flow simulation side plane showing velocity field around the fuselage and vertical stabilizer',
          caption:
            'Longitudinal velocity plane used to inspect fuselage wake and intake behavior.',
        },
      ],
    },
    {
      id: 'custom-avionics-tars-v2-saturn-os',
      heading: 'Custom Avionics: TARS V2 & Saturn OS',
      paragraphs: [
        'Rather than using an off-the-shelf flight controller, I built TARS V2 (24 g total) around an Arduino Nano ESP32-C6 (RISC-V core), an MPU-6050 6-axis IMU, and a Radiomaster RP3 ExpressLRS receiver communicating over CRSF serial.',
        'Because standard Arduino servo libraries conflicted with the ESP32-C6 hardware, I wrote a custom 50 Hz, 12-bit LEDC PWM driver in C++ (Saturn OS) to mix the canards, elevons, and steerable nose gear. Attitude estimation uses a complementary filter (α = 0.9875) feeding three selectable flight modes:',
      ],
      figure: {
        src: 'assets/images/projects/Typhoon/tars-v2.jpg',
        width: 1200,
        height: 704,
        alt: 'TARS V2 custom flight controller with ESP32-C6, MPU-6050 IMU, and dual ExpressLRS antennas',
        caption:
          'TARS V2 flight controller (24 g) integrating the ESP32-C6, MPU-6050 IMU, and Radiomaster RP3 receiver.',
      },
      bullets: [
        {
          lead: 'Manual:',
          body: 'Direct stick-to-surface mixing without active stabilization.',
        },
        {
          lead: 'Angle Stabilization:',
          body: 'Maps stick deflection to target roll/pitch angles via a PID loop (Kp = 1.25, Ki = 0.001, Kd = 0.035).',
        },
        {
          lead: 'Horizontal Failsafe:',
          body: 'Automatically cuts EDF throttle and levels the airframe if the ELRS radio link drops.',
        },
      ],
    },
    {
      id: 'test-campaign-first-flight',
      heading: 'Test Campaign & First Flight',
      paragraphs: [
        'Testing progressed in strict steps—static bench tests (thrust, thermal limits, failsafe behavior), then high-speed taxi runs up to 10 m/s (36 km/h). Taxi testing exposed wheel-alignment tracking issues and the lack of brakes, which I solved by programming the elevons to drag on aborted takeoffs and widening the main gear track after two early ditching incidents.',
        'On January 17, 2026, Typhoon achieved its first liftoff, validating that the NACA 2412 delta-wing airframe generates sufficient lift near the calculated 10.1 m/s stall speed. A sharp uncommanded roll to the right immediately after rotation forced an emergency landing in the adjacent field, damaging the nose gear. Flight testing was paused ahead of the May 9 school exhibition, with future flights planned to log quantitative IMU and airspeed data.',
      ],
    },
  ],
};

export const PORTFOLIO_DATA: PortfolioData = {
  personal: PERSONAL_DATA,
  fieldnotes: HERO_FIELDNOTES,
  about: ABOUT_DATA,
  projectsSection: {
    kicker: 'Selected Engineering Work',
    title: 'Projects & Prototypes',
    subtitle:
      'Simulated in CAD & CFD, fabricated on FDM printers, and validated with custom embedded hardware.',
  },
  projects: PROJECTS_DATA,
  proofOfWork: PROOF_OF_WORK_ITEMS,
  skillsSection: {
    kicker: 'Technical Stack',
    title: 'Skills & Instruments',
  },
  typhoonArticle: TYPHOON_ARTICLE_DATA,
};
