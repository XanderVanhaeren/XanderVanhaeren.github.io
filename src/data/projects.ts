import type { ProjectData, ProjectSlug } from '../types/project';

export const PROJECTS: readonly ProjectData[] = [
  {
    slug: 'typhoon',
    title: 'Project Typhoon',
    subtitle:
      'Aerodynamic airfoil study, 9.15M-cell SolidWorks CFD envelope, 3D-printed delta airframe, and custom ESP32-C6 flight controller ("TARS" / "Saturn OS").',
    route: '/projects/typhoon.html',
    period: '2025–2026',
    context: 'Don Bosco Haacht · 6TWE GSTEMP Thesis (612TWE1)',
    role: 'Sole Author, Airframe Designer & Avionics Engineer',
    status: 'completed',
    statusLabel: 'GSTEMP Thesis & V3 Flight Test',
    tileImage: '/assets/images/projects/typhoon/tile.jpg',
    tileAlt:
      'Project Typhoon V3 open-frame delta-wing RC jet with carbon spine, vase-mode PLA wings, and twin 50 mm EDFs on a dark studio backdrop',
    tileWidth: 1524,
    tileHeight: 1032,
    overlaySummary:
      '821 g twin-50 mm EDF delta-wing RC jet built for a 6TWE GSTEMP thesis investigating how airfoil geometry governs turn-rate maneuverability. Combines NACA 2412 washout wings, 9.15M-cell SolidWorks CFD validation, and the custom ESP32-C6 "TARS" flight controller running 100 Hz C++ stabilization.',
    highlights: [
      'NACA 2412 airfoil (CL,max = 1.29 at 12° AoA) — 34% faster theoretical turn initiation than LS013',
      '821 g total mass, 12.96 N static thrust from twin 50 mm EDFs (1.61 thrust-to-weight, 1,034 W)',
      '9,149,212-cell SolidWorks CFD & 55-point AoA/speed parametric envelope (-10° to +10°, 10–50 m/s)',
      'Custom ESP32-C6 ("TARS") + MPU-6050 + ExpressLRS CRSF flight controller running SaturnV2.ino',
    ],
    tags: [
      'SolidWorks CFD',
      'Fusion 360',
      'ESP32-C6 / C++',
      'ExpressLRS CRSF',
      'PLA / PETG / ASA',
    ],
    heroFigure: {
      src: '/assets/images/projects/typhoon/cutaway-render.png',
      alt: 'X-ray CAD cutaway render of Project Typhoon showing internal 4S LiPo battery, TARS flight controller, carbon wing spars, and twin 50 mm EDF units',
      caption:
        'X-ray CAD assembly of Project Typhoon revealing internal 4S 1550 mAh LiPo placement, TARS flight controller bay, twin carbon spars, and rear twin 50 mm EDF ducts.',
      width: 1600,
      height: 900,
      surface: 'dark',
    },
    specs: [
      { label: 'Dimensions (L × W × H)', value: '602 × 680 × 223 mm' },
      { label: 'Total Mass / Wing Loading', value: '821 g (8.05 N) · 84 N/m²' },
      { label: 'Wing Geometry', value: '0.09575 m² area · AR 4.83 · < 60 g/wing (12G rated)' },
      { label: 'Airfoil & Twist', value: 'NACA 2412 · 4° root → 2° tip washout' },
      { label: 'Propulsion', value: '2× 50 mm EDF (60,800 RPM, 68 A peak, 1,034 W)' },
      { label: 'Static Thrust & T/W', value: '12.96 N (~1.32 kgf) · 1.61 thrust-to-weight' },
      { label: 'Battery & ESC', value: 'Ovonic 1550 mAh 4S 100C LiPo (XT60) · 2× 40A ESC w/ 5V UBEC' },
      {
        label: 'Avionics ("TARS")',
        value: 'nanoESP32-C6 (RISC-V) · MPU-6050 (400 kHz I²C) · RP3 ELRS (420 kbps CRSF)',
      },
    ],
    sections: [
      {
        id: 'motivation-airfoil-study',
        heading: 'Research Question & Airfoil Selection',
        paragraphs: [
          'Project Typhoon originated as a 6TWE GSTEMP senior thesis supervised by M. Van Minsel to bridge high-school embedded engineering with TU Delft Aerospace Engineering coursework. The central research question investigated how airfoil cross-section geometry governs pitch-up turn rate and low-speed stall margin on a compact delta-wing EDF platform.',
          'Three candidate airfoils—NACA 2412, NACA 2408, and LS013—were compared across Reynolds numbers Re ∈ [100,000; 750,000] sized to the delta planform (c_mac = 0.22 m, c_gem = 0.147 m). NACA 2412 reached CL,max = 1.2907 at 12° angle of attack, outperforming NACA 2408 (1.0586 at 8.75°) and LS013 (0.9675 at 10.25°) while delaying trailing-edge separation.',
          'To protect roll authority near stall, the wings incorporate 4° root-to-2° tip geometric washout plus slight positive dihedral, ensuring the inboard section stalls first while the outboard elevons stay attached.',
        ],
        callout: {
          label: 'Theoretical Turn Initiation (30 m/s)',
          content:
            'dγ/dt = (0.5·ρ·v²·cL·A + T·sin(α) − W·cos(γ)) / (m·v) with T = 13 N, m = 0.83 kg, A = 0.1 m² → 2.66 rad/s for NACA 2412 (+34% over LS013).',
        },
        figures: [
          {
            src: '/assets/images/projects/typhoon/chart-airfoils.png',
            alt: 'Lift coefficient CL versus angle of attack comparison chart for NACA 2412, NACA 2408, and LS013',
            caption:
              'Wind-tunnel/polar comparison of NACA 2412, NACA 2408, and LS013 across the Typhoon Reynolds envelope, showing NACA 2412 peaking at CL,max = 1.2907 (12° AoA).',
            width: 1600,
            height: 1250,
            surface: 'dark',
          },
        ],
      },
      {
        id: 'airframe-evolution',
        heading: 'Airframe Architecture & V1 → V3 Evolution',
        paragraphs: [
          'The composite structure pairs a central carbon-fiber spine with twin underslung carbon wing spars positioned beneath the main tube so positive lift loads place the wing-root joints in compression rather than peeling tension. Internal 3D-printed PETG ribs support a single-wall vase-mode PLA skin under 60 g per wing, verified to 12G static load.',
          'Each airframe generation resolved real aerodynamic, propulsion, and landing-gear bottlenecks discovered on the bench and runway:',
        ],
        bullets: [
          {
            lead: 'Murphy Glider',
            body: 'Unpowered cardboard testbed used to tune TARS complementary filtering, elevon throws, and trim polarity before risking printed wings.',
          },
          {
            lead: 'V1 Closed Shell',
            body: 'Full Eurofighter-inspired fuselage enclosed the EDFs but choked intake mass flow, lacked landing gear, and required destructive disassembly to reach wiring.',
          },
          {
            lead: 'V2 Open Frame',
            body: 'Switched to an open carbon/ASA truss frame for unobstructed EDF breathing and field repairability; dropped the heavy vertical rudder actuator, which exposed main-gear alignment flex.',
          },
          {
            lead: 'V3 Flight Configuration',
            body: 'Added fixed canards, steerable nose gear on GPIO 8, widened main-gear track, and tightened total flying mass to 821 g (8.05 N).',
          },
        ],
        figures: [
          {
            src: '/assets/images/projects/typhoon/murphy-glider.jpg',
            alt: 'Cardboard Murphy glider testbed with exposed TARS avionics on a workshop table',
            caption:
              'Murphy cardboard test glider used to validate TARS sensor fusion and elevon mixing prior to 3D-printed airframe flights.',
            width: 1400,
            height: 1050,
            surface: 'neutral',
          },
          {
            src: '/assets/images/projects/typhoon/v1-wings-overhead.jpg',
            alt: 'Overhead view of early Typhoon V1 3D-printed delta wings and fuselage section on a workbench',
            caption:
              'Overhead view of the early V1 closed-shell delta wings built with PETG ribs and single-wall vase-mode PLA skins.',
            width: 1400,
            height: 1050,
            surface: 'neutral',
          },
          {
            src: '/assets/images/projects/typhoon/v3-frame-closeup.jpg',
            alt: 'Close-up of Project Typhoon V3 open ASA fuselage frame housing the LiPo battery and TARS controller',
            caption:
              'V3 open carbon/ASA truss bay housing the 4S LiPo, dual 40A ESCs, and TARS avionics for rapid field servicing.',
            width: 1400,
            height: 1050,
            surface: 'neutral',
          },
        ],
      },
      {
        id: 'cfd-parametric-envelope',
        heading: 'SolidWorks CFD & 55-Point Flight Envelope',
        paragraphs: [
          'Full-aircraft external aerodynamics were simulated in SolidWorks Flow Simulation on a 9,149,212-cell mesh (299,597 solid-contacting cells), converging over 419 iterations across 12 hours and 17 minutes of 8-core CPU runtime.',
          'A 55-point parametric sweep crossed angles of attack from -10° to +10° in 2° steps with airspeeds from 10 to 50 m/s. At 10 m/s and +10° AoA, predicted lift reaches 8.93 N—exceeding the 8.05 N weight and corroborating the 10.1 m/s theoretical stall speed. At a 30 m/s cruise/turn point (+4° AoA), the jet produces 49.99 N of lift for 2.51 N of drag, rising to 229.0 N peak lift at 50 m/s (+10° AoA) well above the 9G = 72.4 N maneuver envelope.',
        ],
        figures: [
          {
            src: '/assets/images/projects/typhoon/cfd-flowsim.png',
            alt: 'SolidWorks Flow Simulation viewport showing mesh and aerodynamic streamlines around the Typhoon fuselage',
            caption:
              'SolidWorks Flow Simulation setup and streamline cut-plot across the 9.15M-cell fluid domain.',
            width: 1600,
            height: 900,
            surface: 'neutral',
          },
          {
            src: '/assets/images/projects/typhoon/cfd-velocity-3d.png',
            alt: '3D translucent velocity isosurface mesh around the Typhoon delta airframe',
            caption:
              '3D velocity isosurface visualization highlighting wake acceleration behind the twin EDF exhausts and wingtip vortices.',
            width: 920,
            height: 529,
            surface: 'dark',
          },
          {
            src: '/assets/images/projects/typhoon/chart-lift-speed.png',
            alt: 'Parametric CFD chart plotting lift force against airspeed across angles of attack',
            caption:
              '55-point parametric CFD lift envelope from 10 to 50 m/s (-10° to +10° AoA), crossing the 8.05 N weight threshold near 10 m/s.',
            width: 1600,
            height: 892,
            surface: 'dark',
          },
          {
            src: '/assets/images/projects/typhoon/chart-drag-speed.png',
            alt: 'Parametric CFD chart plotting aerodynamic drag force against airspeed across angles of attack',
            caption:
              'Corresponding aerodynamic drag curves across the 55-point AoA and airspeed matrix, comparing against 12.96 N static EDF thrust.',
            width: 1600,
            height: 904,
            surface: 'dark',
          },
        ],
      },
      {
        id: 'tars-saturn-os',
        heading: 'Custom Avionics: TARS Hardware & Saturn OS Firmware',
        paragraphs: [
          'The custom TARS avionics board integrates a nanoESP32-C6 RISC-V microcontroller, an MPU-6050 6-axis IMU configured for ±8g / ±500 °/s with a 21 Hz digital low-pass filter on a 400 kHz I²C bus (SDA = 20, SCL = 21), and a Radiomaster RP3 ExpressLRS receiver streaming 420 kbps CRSF frames on UART2 (RX = 4, TX = 5).',
          'Because standard servo libraries conflicted with ESP32-C6 timers, Saturn OS (SaturnV2.ino) drives custom 50 Hz 12-bit LEDC PWM channels (US_TO_DUTY = 4096 / 20000, clamped 1000–2000 µs) for left elevon (GPIO 10), right elevon (GPIO 11), nose-wheel steering (GPIO 8, repurposing the NeoPixel pin), and twin ESC throttle (GPIO 19).',
        ],
        bullets: [
          {
            lead: '100 Hz Deterministic Loop & Bias Calibration',
            body: 'Runs a fixed 10,000 µs (100 Hz) micros() loop after 500 startup gyro calibration samples while the aircraft sits level.',
          },
          {
            lead: 'G-Gated Complementary Filter',
            body: 'Blends integrated gyro rates with accelerometer tilt using α = 0.9875, gating accelerometer updates strictly inside 0.85g–1.15g so high-G turns do not corrupt attitude estimates.',
          },
          {
            lead: 'Gyro-Rate D-Term PID & Proportional Elevon Mixer',
            body: 'Stabilizes pitch and roll (±30° angle limit; Kp = 1.25, Ki = 0.001, Kd = 0.035, iLimit = 25.0) and scales pitch/roll commands proportionally inside writeElevons() whenever |pitchCmd| + |rollCmd| exceeds 500 − |ELEVON_TRIM| so roll authority never clips.',
          },
          {
            lead: 'Safety Arming & Flight Modes',
            body: 'Arming requires both CH5 switch active and throttle ≤ 1050 µs; supports Manual (with CH9 +215 µs takeoff pitch boost), Angle (±30°), and Auto/Failsafe (0° wings-level + motor cutoff).',
          },
        ],
        figures: [
          {
            src: '/assets/images/projects/typhoon/saturn-os-architecture.png',
            alt: 'Saturn OS flight controller software architecture diagram showing CRSF input, IMU fusion, PID mixer, and LEDC outputs',
            caption:
              'Saturn OS real-time control flow from 420 kbps CRSF radio link and 400 kHz MPU-6050 I²C sampling to proportional elevon and ESC PWM outputs.',
            width: 1600,
            height: 1146,
            surface: 'dark',
          },
          {
            src: '/assets/images/projects/typhoon/tars-v2-cased.jpg',
            alt: 'TARS V2 flight controller inside its 3D-printed protective enclosure',
            caption:
              'Cased TARS V2 flight controller module integrating the nanoESP32-C6, MPU-6050 IMU, and header pinouts.',
            width: 1400,
            height: 822,
            surface: 'light',
          },
          {
            src: '/assets/images/projects/typhoon/tars-uncased.jpg',
            alt: 'Uncased TARS flight controller PCB showing soldered nanoESP32-C6, MPU-6050 breakout, and servo headers',
            caption:
              'Internal perfboard assembly of TARS showing the nanoESP32-C6, MPU-6050 breakout, and pin wiring before enclosure assembly.',
            width: 1400,
            height: 1050,
            surface: 'neutral',
          },
        ],
      },
      {
        id: 'taxi-and-first-flight',
        heading: 'Taxi Trials & January 17, 2026 First Flight',
        paragraphs: [
          'Static bench testing confirmed 12.96 N thrust (1.61 T/W) at 68 A peak and verified radio failsafe motor cutoffs. Subsequent 10 m/s (36 km/h) taxi runs on rural asphalt exposed two practical ground-handling issues: without wheel brakes, stopping distance was solved by deflecting both elevons to scrape aerodynamic drag; and after two crosswind ditchings, the main landing-gear track was widened.',
          'On January 17, 2026, Project Typhoon V3 rotated cleanly and lifted off near the 10.1 m/s predicted stall speed, validating the NACA 2412 wing and twin-EDF thrust margin. Seconds into climb-out, an unexpected uncommanded right roll forced an emergency field landing that damaged the nose gear. Testing was paused ahead of the May 9, 2026 school exhibition, identifying airspeed-based PID gain scheduling as the key control upgrade.',
        ],
        figures: [
          {
            src: '/assets/images/projects/typhoon/runway-test.jpg',
            alt: 'Project Typhoon V3 positioned on a rural asphalt road during high-speed taxi and maiden flight testing',
            caption:
              'Project Typhoon V3 lined up on the rural asphalt test strip during the January 2026 taxi and maiden-flight campaign.',
            width: 992,
            height: 655,
            surface: 'neutral',
          },
        ],
      },
    ],
    sourcesNote:
      'Verified from GSTEMP Scriptie VERSIE2.docx, SaturnV2.ino, SolidWorks CFD simulation exports, and V1–V3 test documentation.',
  },
  {
    slug: 'bikeysens',
    title: 'Bikeysens',
    subtitle:
      'DIY €98.86 mountain bike suspension, brake-temperature, and IMU telemetry logger with handlebar OLED and 144 Hz Python replay suite.',
    route: '/projects/bikeysens.html',
    period: '2023–2024',
    context: 'Don Bosco Haacht · 4th Year Engineering Project (410TEW1)',
    role: 'Sole Developer — Hardware, Embedded Python & Desktop Suite',
    status: 'completed',
    statusLabel: 'Completed & Field-Tested (4.27 h Log)',
    tileImage: '/assets/images/projects/bikeysens/tile.jpg',
    tileAlt:
      'Canyon Spectral 125 mountain bike equipped with Bikeysens telemetry sensors resting against a tree on a wooded trail',
    tileWidth: 1600,
    tileHeight: 1200,
    overlaySummary:
      'Built a sub-€100 modular mountain bike telemetry system on a Canyon Spectral 125 to rival €1,800–€2,400 commercial loggers. A Raspberry Pi Zero 2 W logs fork ToF travel, rear shock travel, 6-DOF IMU dynamics, brake actuation, and caliper temperature via dual-thread Python and Cat-5a RJ45 sensor harnesses.',
    highlights: [
      '€98.86 final build cost (€156.61 incl. spares) vs. €1,800–€2,400 commercial MTB telemetry',
      'Multi-threaded Raspberry Pi Zero 2 W logging ~1 ms sensor loops with 1,000-row pandas CSV flushes',
      '13-iteration 3D-printed VL6180X ToF fork travel sensor (140 mm Fox 36) + SLX brake lever & 36GZ caliper temp',
      '174,530-row (4.27-hour) field dataset capturing 7.52 g impacts and 135 mm fork bottom-outs',
    ],
    tags: [
      'Raspberry Pi Zero 2 W',
      'Python / pandas / Pyglet',
      'I²C Sensors (ToF / IMU / ADC)',
      '3D Printing (PLA / ASA)',
      'RJ45 Modular Harness',
    ],
    heroFigure: {
      src: '/assets/images/projects/bikeysens/central-unit-frame.jpg',
      alt: 'Raspberry Pi Zero 2 W central telemetry enclosure strapped under the Canyon Spectral 125 top tube above the Fox Float rear shock',
      caption:
        'Central Raspberry Pi Zero 2 W and perfboard hub mounted inside the Canyon Spectral 125 frame triangle with quick-disconnect Cat-5a RJ45 sensor ports.',
      width: 1400,
      height: 1050,
      surface: 'neutral',
    },
    specs: [
      {
        label: 'Test Platform',
        value: 'Canyon Spectral 125 (M, 29") · Fox 36 Rhythm (140 mm) · Fox Float (125 mm)',
      },
      {
        label: 'On-Bike Compute',
        value: 'Raspberry Pi Zero 2 W (Quad ARM Cortex-A53, Wi-Fi/SSH/Samba, Cron auto-boot)',
      },
      {
        label: 'Front & Rear Travel',
        value: 'VL6180X ToF laser (0x29, 5–10% err) · Rear potentiometer on ADS1115 P0',
      },
      {
        label: 'IMU & Braking',
        value: 'GY-521 MPU-6050 (0x68) · Hall-effect magnet (GPIO 27) + 36GZ temp (ADS1115 P1)',
      },
      {
        label: 'Handlebar Display',
        value: 'SSD1306 128×64 I²C OLED (v5.64) + single GPIO 4 tab/record button',
      },
      { label: 'Interconnect', value: 'Custom perfboard hub + UTP Cat-5a Ethernet / RJ45 (< 10 min install)' },
      { label: 'Power & Runtime', value: 'Salvaged powerbank cells + €1.97 Li-ion charger (~12 h estimated runtime)' },
      { label: 'Final Build Cost', value: '€98.86 on bike (€156.61 total incl. spares; target €100–€200)' },
    ],
    sections: [
      {
        id: 'motivation-and-budget',
        heading: 'Goal: Democratizing €2,000 MTB Telemetry',
        paragraphs: [
          'Inspired by Canyon Cllctv downhill racer Mille Johnset’s telemetry setup, commercial mountain-bike suspension loggers typically cost €1,800–€2,400—far beyond amateur riders. Bikeysens set out to capture comparable fork, shock, braking, and chassis dynamics within a €100–€200 budget on a Canyon Spectral 125 (140 mm Fox 36 Rhythm, 125 mm Fox Float, Shimano SLX hydraulic brakes).',
          'By combining off-the-shelf I²C breakout boards, salvaged lithium cells, and 3D-printed brackets, the final on-bike hardware reached €98.86 (€156.61 including spares and prototyping materials).',
        ],
        specs: [
          { label: 'Compute & Storage', value: 'Raspberry Pi Zero 2 W (€20.00) + Canyon Frame Bag (€35.00)' },
          { label: 'Filaments & Harness', value: 'PLA (€8.00) + ASA (€8.00) + Cat-5a / RJ45 plugs (€6.00)' },
          {
            label: 'Sensors & Display',
            value: 'VL6180X (€2.84) + SSD1306 (€2.25) + ADS1115 (€1.40) + GY-521 (€0.46)',
          },
          {
            label: 'Power & Mounting',
            value: 'Li-ion charger (€1.97) + EC360 thermal epoxy (€4.99) + salvaged cells/36GZ (€0)',
          },
        ],
        figures: [
          {
            src: '/assets/images/projects/bikeysens/bom-table.png',
            alt: 'Bikeysens bill of materials spreadsheet detailing component costs totaling €98.86 on bike',
            caption:
              'Complete bill of materials from PortfolioBikeySensFinal.docx breaking down the €98.86 on-bike build and €156.61 total expenditure.',
            width: 372,
            height: 583,
            surface: 'light',
          },
        ],
      },
      {
        id: 'modular-hardware-sensors',
        heading: 'Modular Sensor Architecture & 13-Version 3D Prints',
        paragraphs: [
          'Early breadboard prototypes failed under trail vibration, so every sensor was wired through a soldered perfboard hub inside a 3D-printed ASA/PLA enclosure using UTP Cat-5a Ethernet cables and RJ45 connectors. The entire kit installs or detaches from the bike in under 10 minutes.',
          'Each sensing channel required custom mechanical packaging to survive mud, fork compression, and brake heat without permanently altering the bike:',
        ],
        bullets: [
          {
            lead: 'Front Fork Travel (13 Revisions)',
            body: 'A VL6180X time-of-flight laser sensor (0x29, offset = -10 in ToF.py, returning 140 - range in mm) rides inside a telescoping 3D-printed tube alongside the Fox 36 stanchion—evolved across 13 iterations from PVC pipe prototypes to V13 with 5–10% accuracy.',
          },
          {
            lead: 'Rear Shock & Brake Temperature',
            body: 'A 16-bit ADS1115 I²C ADC reads a linear rear-shock potentiometer (P0, calibrated to 125 mm stroke) and an analog 36GZ brake-caliper temperature sensor (P1, (V - 0.5) × 100 °C) bonded non-destructively with removable EC360 thermal epoxy.',
          },
          {
            lead: 'Brake Actuation & 6-DOF IMU',
            body: 'A salvaged speedometer reed/magnet switch on GPIO 27 (PUD_UP) clips onto the Shimano SLX lever via a 3D-printed linkage, paired with a frame-mounted GY-521 MPU-6050 (0x68) running 250-sample startup calibration.',
          },
          {
            lead: 'Handlebar OLED Cockpit (v5.64)',
            body: 'An SSD1306 128×64 OLED (Oled.py using MinecraftRegular.otf) and single GPIO 4 button let the rider short-press through Front, Back, Brake, and Gyro live views or long-press (> 1 s) to start/stop CSV recording.',
          },
        ],
        figures: [
          {
            src: '/assets/images/projects/bikeysens/cockpit-oled.jpg',
            alt: 'Handlebar-mounted 3D-printed SSD1306 OLED pod displaying BikeySens v5.64 by Xander',
            caption:
              'Handlebar cockpit pod displaying BikeySens v5.64 firmware with tactile GPIO 4 tab/recording button.',
            width: 1050,
            height: 1400,
            surface: 'neutral',
          },
          {
            src: '/assets/images/projects/bikeysens/fork-tof-sensor.jpg',
            alt: 'Telescoping 3D-printed VL6180X ToF travel tube mounted next to the Fox 36 fork stanchion',
            caption:
              'Final 13-iteration telescoping VL6180X ToF housing strapped alongside the 140 mm Fox 36 Rhythm fork leg.',
            width: 1050,
            height: 1400,
            surface: 'neutral',
          },
          {
            src: '/assets/images/projects/bikeysens/brake-lever-sensor.jpg',
            alt: '3D-printed magnet linkage mounted on a Shimano SLX hydraulic brake lever',
            caption:
              'Shimano SLX brake lever trigger housing the salvaged magnetic actuation switch wired to GPIO 27.',
            width: 1050,
            height: 1400,
            surface: 'neutral',
          },
          {
            src: '/assets/images/projects/bikeysens/kit-flatlay.jpg',
            alt: 'Complete Bikeysens modular sensor kit and RJ45 Cat-5a harnesses laid out detached from the bike',
            caption:
              'Full modular Bikeysens harness detached from the bike—central Pi enclosure, OLED pod, ToF fork tube, brake switch, and RJ45 cabling.',
            width: 1050,
            height: 1400,
            surface: 'neutral',
          },
          {
            src: '/assets/images/projects/bikeysens/fork-cad-section.png',
            alt: 'CAD cross-section of the telescoping ToF fork sensor tube and internal alignment ring',
            caption:
              'CAD section view of the telescoping VL6180X housing showing the internal laser path and dust-shielding overlap.',
            width: 426,
            height: 276,
            surface: 'dark',
          },
          {
            src: '/assets/images/projects/bikeysens/central-unit-cad.jpg',
            alt: 'Blender CAD render of the Bikeysens central enclosure with RJ45 port cutouts',
            caption:
              'Blender CAD render of the central Raspberry Pi Zero 2 W and perfboard hub housing.',
            width: 671,
            height: 379,
            surface: 'neutral',
          },
        ],
      },
      {
        id: 'multithreaded-python-suite',
        heading: 'Multi-Threaded Logger & 144 Hz "Bike Suite" Replay',
        paragraphs: [
          'On the Raspberry Pi Zero 2 W, bikey.py splits acquisition and storage across threads via queue.Queue: the acquisition loop polls sensors at ~1 ms intervals while the logger thread batches 1,000 rows into pandas DataFrames before flushing CSV files to /home/xander/shared/ and updating the OLED.',
          'Cron auto-boots the logger headlessly on power-up, and logs sync over Wi-Fi via SSH/Samba. Back on the desktop, CSV_Suspension.py renders a 1920×1080 Pyglet "Bike Suite" telemetry player at 144 Hz—applying moving-average smoothing (roll = 15, pitch = 25, travel = 5, temp = 15) to animate layered Fox 36 fork compression, Shimano SLX lever pull, brake-temp gauge needle, and chassis pitch/roll sprites. Grafana live streaming was dropped due to school Wi-Fi restrictions after initial prototyping.',
        ],
        figures: [
          {
            src: '/assets/images/projects/bikeysens/desktop-suite.png',
            alt: '1920x1080 Pyglet Bike Suite desktop telemetry replay showing animated Canyon bike, Fox 36 fork, SLX lever, and brake temperature gauge',
            caption:
              'Pyglet 144 Hz "Bike Suite" replay interface animating smoothed fork compression, rear shock travel, Shimano SLX brake input, caliper temperature, and bike lean/pitch.',
            width: 1291,
            height: 725,
            surface: 'dark',
          },
        ],
      },
      {
        id: 'field-data-and-lessons',
        heading: 'Pumptrack Telemetry & Field Lessons',
        paragraphs: [
          'Testing progressed from garage bench calibration to street rides and full pumptrack/BMX track sessions. Three recorded ride logs—CSV_bikev2.csv (5,570 rows, ~8.1 min, 10–138 mm fork travel, 4.83 g peak), CVSDocuBrake.csv (2,530 rows, brake temperature 14.89–42.8 °C, 4.92 g peak), and CSV_FinalTesr.csv (174,530 rows spanning 15,382 s / 4.27 hours with 7.52 g peak shock)—verified end-to-end logging under trail abuse.',
          'Candidly, a heavy 7–8 g pumptrack landing that compressed the Fox 36 to 135 mm / 140 mm yanked RJ45 plugs loose mid-session; hot-gluing connectors kept testing running for the final log. Future v2 priorities include screw-locking Coax/VGA connectors, replacing the Linux Pi boot delay with an instant-on ESP32 logger, full IP-rated waterproofing, and ANT+ integration with a Garmin bike computer.',
        ],
      },
    ],
    sourcesNote:
      'Verified from PortfolioBikeySensFinal.docx, bikey.py, ToF.py, ADC.py, GY521.py, Oled.py, CSV_Suspension.py, and recorded CSV ride logs.',
  },
  {
    slug: 'rcxd',
    title: 'RCXD',
    subtitle:
      'Three-node Wi-Fi tracked exploration rover with 40 Hz C++ XInput differential drive, live ESP32-CAM MJPEG FPV stream, and Arduino Cloud thermal telemetry.',
    route: '/projects/rcxd.html',
    period: '2024–2025',
    context: 'Don Bosco Haacht · 512 TWE Engineering Project',
    role: 'Hardware, Fusion 360 CAD/3D Printing, MOSFET Driver, MKR1010 Cloud & ESP-CAM Co-Dev',
    team: "Xander Vanhaeren & Lois Farasyn (Teacher: W. T'Seyen)",
    status: 'completed',
    statusLabel: 'Completed & Demonstrated',
    tileImage: '/assets/images/projects/rcxd/tile.jpg',
    tileAlt:
      'Tracked RCXD rover with carbon-textured 3D-printed front housing, yellow LED lightbar, FPV camera, and top-mounted powerbank on a wooden deck',
    tileWidth: 1600,
    tileHeight: 1200,
    overlaySummary:
      'Built a Wi-Fi-controlled tracked exploration rover from a stripped Nikko chassis, a custom Fusion 360 PLA/ABS shell with heat-set inserts, and three independent Wi-Fi nodes: an ESP32-C6 TCP motor server driven by a 40 Hz C++ XInput client, an ESP32-CAM MJPEG FPV stream, and an Arduino MKR1010 Cloud telemetry/light controller.',
    highlights: [
      'Three decoupled Wi-Fi subsystems: ESP32-C6 drive (TCP :1234), ESP32-CAM MJPEG (:80), MKR1010 Arduino Cloud',
      'Windows C++ XInput ground client polling at 40 Hz with 128–255 PWM torque-deadzone remap',
      'Custom dual-IRLZ44 logic-level N-MOSFET motor driver in heat-resistant ABS shell (up to 80 °C)',
      'Solved throttle-induced camera brownouts via isolated USB powerbank & hardware board swap',
    ],
    tags: [
      'ESP32-C6 / ESP32-CAM',
      'Arduino MKR1010 + Cloud',
      'C++ (Winsock2 / XInput)',
      'IRLZ44 MOSFET Driver',
      'Fusion 360 (PLA / ABS)',
    ],
    heroFigure: {
      src: '/assets/images/projects/rcxd/outdoor-action.jpg',
      alt: 'Tracked RCXD rover climbing a wooden beam outdoors with its yellow 5 V LED lightbar illuminated',
      caption:
        'RCXD field demonstration climbing a wooden obstacle outdoors with its 5 V LED headlight and carbon-textured 3D-printed nose active.',
      width: 1600,
      height: 1200,
      surface: 'neutral',
    },
    specs: [
      { label: 'Base Chassis', value: 'Gutted Nikko tracked drive + twin DC gear motors + 7.4 V battery' },
      {
        label: 'Body Construction',
        value: 'Fusion 360 3D-printed PLA (shell) & ABS (MOSFET/LED heat zones) + heat-set inserts',
      },
      { label: 'Drive Controller', value: 'ESP32-C6 TCP server (port 1234) → analogWrite(18, L) & analogWrite(9, R)' },
      {
        label: 'Power Electronics',
        value: 'Dual IRLZ44 N-MOSFETs, flyback diodes, decoupling caps, pull-down/gate resistors',
      },
      { label: 'Ground Station', value: 'Windows C++ (XInput + Winsock2), 25 ms (40 Hz) polling, 128–255 PWM remap' },
      { label: 'FPV Video Node', value: 'AI-Thinker ESP32-CAM + external antenna, HTTP MJPEG (:80), VGA JPEG q=20' },
      { label: 'Telemetry & Light', value: 'Arduino MKR1010 → Arduino Cloud (5 V LED bar + TMP36 MOSFET temp)' },
      { label: 'Camera Power', value: 'Dedicated top-mounted USB powerbank (eliminated 7.4 V motor sag brownouts)' },
    ],
    sections: [
      {
        id: 'concept-and-mechanical-design',
        heading: 'Concept Pivot & Fusion 360 PLA/ABS Shell',
        paragraphs: [
          'After pivoting away from an initial "wireless USB cable" concept, Xander Vanhaeren and teammate Lois Farasyn built the RCXD (Remote-Controlled eXploration Device) for 512 TWE under teacher W. T’Seyen. A broken Nikko RC tank was stripped down to its rubber tracks, twin DC gear motors, and 7.4 V pack.',
          'The upper body was modeled in Fusion 360 using heat-set threaded inserts for repeatable assembly. Because the dual IRLZ44 MOSFETs could reach ~80 °C—above PLA’s ~60 °C softening threshold—the MOSFET carrier and LED bezel were printed in heat-resistant ABS while the remaining upper shell used carbon-textured PLA. Retrospectively, the team noted that multi-piece shell modeling was slightly over-engineered relative to the project schedule.',
        ],
        figures: [
          {
            src: '/assets/images/projects/rcxd/cad-chassis-render.png',
            alt: 'Fusion 360 CAD render of the custom RCXD upper shell over the Nikko tracked chassis',
            caption:
              'Fusion 360 assembly render combining the salvaged Nikko tracked base with the multi-part 3D-printed upper shell.',
            width: 1100,
            height: 661,
            surface: 'neutral',
          },
          {
            src: '/assets/images/projects/rcxd/fdm-printing.jpg',
            alt: 'FDM 3D printer fabricating structural RCXD housing parts',
            caption:
              'FDM printing of the PLA/ABS upper body components engineered around heat-set M3 brass inserts.',
            width: 656,
            height: 375,
            surface: 'neutral',
          },
        ],
      },
      {
        id: 'three-node-wifi-architecture',
        heading: 'Three-Node Wi-Fi Architecture & MOSFET Motor Driver',
        paragraphs: [
          'To keep real-time motor control, video streaming, and cloud lighting isolated, the rover splits responsibilities across three Wi-Fi microcontrollers. Xander led Fusion 360 CAD/printing, the dual-IRLZ44 MOSFET driver, and Arduino MKR1010 Cloud telemetry while co-developing the ESP32-CAM stream alongside Lois Farasyn’s ESP32-C6 TCP server and Windows C++ XInput ground client.',
        ],
        bullets: [
          {
            lead: 'Node 1 — Drive (ESP32-C6 + Winsock2 / XInput)',
            body: 'tcp_client.cpp polls an Xbox controller (or emulated steering wheel/pedals) every 25 ms (40 Hz), computes differential inside-track throttling via gas_percent * (1.0f - wheel_percent), remaps 0–100% into 128–255 PWM (clamping < 130 to 0 because duties below 50% stalled the tracks), and streams "L; R\\n" over TCP port 1234 to GPIO 18 and GPIO 9.',
          },
          {
            lead: 'Power Stage — Dual IRLZ44 Logic-Level MOSFETs',
            body: '3.3 V GPIO PWM signals drive logic-level IRLZ44 N-MOSFETs fitted with gate resistors, pull-downs, decoupling capacitors, and motor flyback diodes to clamp inductive voltage spikes.',
          },
          {
            lead: 'Node 2 — FPV Video (AI-Thinker ESP32-CAM)',
            body: 'Serves an HTTP MJPEG multipart/x-mixed-replace feed on port 80 (FRAMESIZE_VGA, JPEG quality 20, external Wi-Fi antenna, 100 ms loop delay in the final hotspot sketch).',
          },
          {
            lead: 'Node 3 — Cloud Lighting & Thermal Monitoring (MKR1010)',
            body: 'Connects to an Arduino Cloud mobile dashboard to toggle the front 5 V yellow LED bar and log TMP36 MOSFET temperature.',
          },
        ],
        figures: [
          {
            src: '/assets/images/projects/rcxd/system-architecture.png',
            alt: 'Three-node Wi-Fi architecture diagram showing Xbox/ESP32 drive, ESP32-CAM FPV stream, and MKR1010 Arduino Cloud telemetry',
            caption:
              'Decoupled three-node Wi-Fi architecture separating low-latency TCP drive control, MJPEG FPV video, and Arduino Cloud lighting/thermal telemetry.',
            width: 900,
            height: 1020,
            surface: 'light',
          },
          {
            src: '/assets/images/projects/rcxd/steering-flowchart.png',
            alt: 'Differential drive steering flowchart mapping joystick X-axis deflection to left and right track PWM values',
            caption:
              'Differential drive logic flowchart translating joystick X-axis steering into left/right track speed attenuation.',
            width: 670,
            height: 699,
            surface: 'light',
          },
          {
            src: '/assets/images/projects/rcxd/mosfet-schematic.png',
            alt: 'Breadboard wiring schematic of the dual IRLZ44 N-MOSFET motor driver with flyback diodes and gate resistors',
            caption:
              'Dual-IRLZ44 logic-level MOSFET motor driver schematic with flyback protection diodes and pull-down resistors.',
            width: 1178,
            height: 509,
            surface: 'light',
          },
          {
            src: '/assets/images/projects/rcxd/esp-cam-pov.jpg',
            alt: 'Live VGA MJPEG FPV frame captured from the onboard AI-Thinker ESP32-CAM',
            caption:
              'Live onboard VGA MJPEG FPV frame streamed over Wi-Fi from the nose-mounted AI-Thinker ESP32-CAM.',
            width: 1600,
            height: 900,
            surface: 'dark',
          },
        ],
      },
      {
        id: 'debugging-and-telemetry',
        heading: 'Power Brownout Debugging, Thermal Telemetry & Lessons',
        paragraphs: [
          'Full-throttle acceleration initially sagged the shared 7.4 V motor pack enough to trigger brownout resets on the ESP32-CAM. Moving the camera onto its own top-mounted USB powerbank isolated the RF video link from motor inrush currents.',
          'Even on clean USB power, persistent brownout panics resisted disabling RTC_CNTL_BROWN_OUT_REG and swapping camera sensors—until replacing the AI-Thinker ESP32-CAM board itself proved the original module had a hardware power defect. Arduino Cloud subsequently captured clean 26–35 °C MOSFET thermal logs, though the TMP36 lead snapped mechanically during transport to school. While decoupling into three nodes kept each subsystem clean, parallel hardware/software development compressed final integration time.',
        ],
        figures: [
          {
            src: '/assets/images/projects/rcxd/cloud-temp-plot.png',
            alt: 'Arduino Cloud time-series plot logging MOSFET temperature between 26 and 35 degrees Celsius',
            caption:
              'Arduino Cloud dashboard telemetry recording 26–35 °C MOSFET temperatures via the MKR1010 + TMP36 probe during drive tests.',
            width: 1471,
            height: 628,
            surface: 'light',
          },
        ],
      },
    ],
    sourcesNote:
      'Verified from RCXD Portfolio.docx, RCXDPresentatie.pptx, arduino_RC-DC.ino, RCXD_copy_HOTSPOT.ino, Motor_calc.cpp, and tcp_client.cpp.',
  },
  {
    slug: 'team-214',
    title: 'Peno team 214',
    subtitle:
      'Purely mechanical autonomous "Babybalestafette" ball-relay catapult for KU Leuven P&O-1a (Fall 2026 — active post-TZ3 prototype & Experiment 1).',
    route: '/projects/team-214.html',
    period: 'Oct–Nov 2026 (Active)',
    context: 'KU Leuven · Faculty of Engineering Science · P&O-1a',
    role: 'Team Leader (Groepsleider), CAD, Laser-Cutting & 3D Printing',
    team: 'Xander Vanhaeren (r1162258), Daan Van Camp (r1157113), Hannes Yperman (r1173692), Zeno Wittevrongel (r1100375)',
    status: 'in-progress',
    statusLabel: 'In Progress · Post-TZ3 Prototype & Experiment 1 Complete',
    tileImage: '/assets/images/projects/team-214/tile.jpg',
    tileAlt:
      'Blender render of Peno team 214 mechanical ball-relay catapult with bent twin carbon-fiber spring rods, slotted MDF latch tower, and suspended catch basket',
    tileWidth: 1600,
    tileHeight: 1067,
    overlaySummary:
      'Active Fall 2026 KU Leuven P&O-1a "Babybalestafette" project. Designing a zero-electronics, sub-€30 mechanical catapult on a 30×60 cm MDF island that catches an incoming 29 g ball and automatically triggers a twin carbon-rod torsion launch across a 30–120 cm sea gap. Currently built through post-TZ3 MDF/3D-printed prototype and MATLAB Experiment 1 spring characterization.',
    highlights: [
      'Strict constraints: zero electronics/power, 30×60 cm footprint, ≤ 60 cm height, ≤ 10 m/s, ≤ €30 budget',
      'Twin Ø 2 mm carbon-fiber torsion leaf spring (212 mm active arm) + 20 cm slotted hex-bolt range adjuster',
      'MATLAB Experiment 1 (Series 2–4): M = (1.97 N·m/rad)θ + 0.0063 N·m, Adjusted R² = 0.98',
      'Active milestone status: TZ3 physical MDF prototype & CAD renders complete; Verslag 2/3 & relay demo ahead',
    ],
    tags: [
      'KU Leuven P&O-1a',
      'Blender CAD & FabLab',
      'Laser-Cut 4 mm MDF',
      '3D Printing (PLA)',
      'MATLAB Regression',
    ],
    heroFigure: {
      src: '/assets/images/projects/team-214/full-cycle-render.jpg',
      alt: 'Full-cycle Blender composite render illustrating incoming ball capture, loaded carbon torsion spring, and launch trajectory',
      caption:
        'Full-cycle Blender CAD render illustrating the incoming 29 g ball entering the suspended catch basket, releasing the slotted latch, and launching via the twin carbon-rod spring.',
      width: 1500,
      height: 1000,
      surface: 'dark',
    },
    video: {
      src: '/assets/images/projects/team-214/animation.mp4',
      title: '3D Mechanism Cycle Animation',
      caption:
        'Blender mechanism cycle animation (Peno.mp4) showing catch-basket drop, nylon cord pull, slotted latch release, and carbon-rod launch.',
      poster: '/assets/images/projects/team-214/full-cycle-render.jpg',
    },
    specs: [
      { label: 'Course & Team', value: 'KU Leuven P&O-1a (2026–2027) · Team 214 (4 students)' },
      { label: 'Project Status', value: 'Active (through Nov 19, 2026 — Post-TZ3 & Verslag 1 submitted)' },
      { label: 'Footprint & Height', value: '30 × 60 cm 4 mm MDF island · ≤ 60 cm height · zero overhang' },
      { label: 'Energy Constraint', value: '100% mechanical (zero electronics, power, or living organisms) · ≤ 10 m/s' },
      { label: 'Target Ball & Basket', value: '29 g baby ball (~58–61 mm diameter) · Ø 13 cm catch basket' },
      { label: 'Spring Element', value: '2× Ø 2 mm carbon-fiber rods (267 × 35 × 5 mm total; r = 212 mm active)' },
      { label: 'Spring Constant (Exp. 1)', value: 'k = 1.97 N·m/rad (Adj R² = 0.98, ±0.0212 N·m)' },
      { label: 'Relay Range & Budget', value: '30–120 cm sea gap (30 cm steps) · ≤ €30 total budget' },
    ],
    sections: [
      {
        id: 'relay-challenge-and-rules',
        heading: 'The "Babybalestafette" Challenge & Constraints',
        paragraphs: [
          'For KU Leuven’s first-year P&O-1a engineering design course, Team 214 is building an autonomous mechanical relay station for the "Babybalestafette." Each team’s apparatus sits on a 30 × 60 cm 4 mm MDF "island": it must catch a 29 g (~58–61 mm diameter) baby ball thrown by the previous team inside a provided Ø 13 cm basket in the front half of the board, then use that impact energy solely as a trigger to launch a second ball across a 30–120 cm "sea" gap (30 cm increments, up to 20 points per trial at 120 cm across three scored runs).',
          'Rules prohibit all electronics, batteries, mains power, and living organisms. Total height cannot exceed 60 cm with zero overhang beyond the 30 × 60 cm baseplate, launch speed is capped at ≤ 10 m/s, total material cost must stay ≤ €30, and teams get a 5-minute reset window between scored runs.',
        ],
      },
      {
        id: 'mechanical-architecture',
        heading: 'Mechanical Design: Carbon Leaf-Torsion Spring & Slotted Latch',
        paragraphs: [
          'Rather than coupling a coil spring through heavy pivoting arms with friction losses, Team 214 chose twin Ø 2 mm carbon-fiber rods (267 × 35 × 5 mm overall assembly: 35 mm clamped base, r = 212 mm active bending arm, and 20 mm tip) acting directly as an elastic cantilever leaf-torsion spring.',
        ],
        bullets: [
          {
            lead: '3-Point Suspended Basket & Truss Towers',
            body: 'The Ø 13 cm catch basket hangs from three points between two outer laser-cut 4 mm MDF triangular trusses to suppress lateral sway; spring-return on the basket was deliberately rejected in TZ3 to avoid rebound oscillation.',
          },
          {
            lead: 'Nylon Cord Trigger & Low-Friction Guide',
            body: 'A yellow nylon cord runs from the basket over a 3D-printed grooved guide (TowerTop.stl) mounted atop a central tower height-matched to the latch top for maximum release leverage.',
          },
          {
            lead: '20 cm Slotted Latch (gleuf) & Ball Cradle (houder_bal.stl)',
            body: 'An adjustable hex-bolt and nut sliding inside a 20 cm vertical slot sets spring preload deflection continuously for 30–120 cm sea gaps without re-cutting the baseplate, while a 4-prong 3D-printed cradle holds the 29 g ball securely through release.',
          },
          {
            lead: 'FabLab Nesting & Table Protection',
            body: 'Smaller latch and bracket DXFs were nested inside unused baseplate cutouts to save laser-cut stock, and raised corner feet keep protruding tenon tabs off lab tables.',
          },
        ],
        figures: [
          {
            src: '/assets/images/projects/team-214/tz3-schematic.jpg',
            alt: 'Annotated post-TZ3 design schematic labeling the truss towers, 20 cm latch slot, cord guide, and carbon-rod spring',
            caption:
              'Post-TZ3 mechanism schematic (ontwerp_na_TZ3.png) detailing the 3-point basket suspension, height-matched guide tower, and slotted latch trigger.',
            width: 1400,
            height: 933,
            surface: 'light',
          },
          {
            src: '/assets/images/projects/team-214/side-elevation.jpg',
            alt: 'Orthographic side-elevation Blender render of the Team 214 catapult showing spring deflection and launch arc',
            caption:
              'Orthographic side elevation illustrating the bent twin carbon rods, trigger cord geometry, and ball launch path.',
            width: 1600,
            height: 800,
            surface: 'dark',
          },
          {
            src: '/assets/images/projects/team-214/latch-slot-detail.jpg',
            alt: 'Close-up Blender render of the 20 cm vertical slotted MDF latch and adjustable hex bolt retaining the carbon rods',
            caption:
              'Detail render of the 20 cm slotted MDF latch (gleuf) and hex-bolt preload stop controlling launch energy.',
            width: 1600,
            height: 900,
            surface: 'dark',
          },
          {
            src: '/assets/images/projects/team-214/basket-truss-detail.jpg',
            alt: 'Close-up render of the Ø 13 cm catch basket suspended between laser-cut MDF triangular trusses',
            caption:
              'Close-up of the Ø 13 cm catch basket suspended by three cords inside the laser-cut 4 mm MDF truss towers.',
            width: 1200,
            height: 1200,
            surface: 'dark',
          },
        ],
      },
      {
        id: 'experiment-1-spring-characterization',
        heading: 'Experiment 1: MATLAB Spring Characterization (Verslag 1)',
        paragraphs: [
          'For Verslag 1 (verslag-1_v3(def).pdf), the twin carbon-rod spring was clamped vertically in a bench vise and deflected from 0° to 45° in 5° steps across four measurement series using a perpendicular ±0.1 N dynamometer at active lever arm r = 0.212 m.',
          'Series 1 was excluded after hook rotation distorted the effective moment arm. Fitting Series 2–4 in MATLAB (fit(theta, M, "poly1") in lineaire_regressie.m) confirmed clean linear torsion behavior with a target ≥ 7.5 cm deflection window and 80–85% impulse transfer efficiency (1.1× energy margin) onto the soft 29 g ball.',
        ],
        callout: {
          label: 'MATLAB Experiment 1 Fit (Series 2–4)',
          content:
            'M = (1.97 N·m/rad)·θ + 0.0063 N·m  |  k = 1.97 N·m/rad  |  Adjusted R² = 0.98  |  Uncertainty = ±0.0212 N·m',
        },
        figures: [
          {
            src: '/assets/images/projects/team-214/spring-regression.png',
            alt: 'MATLAB linear regression plot of bending moment M versus deflection angle theta for Series 2–4',
            caption:
              'MATLAB linear regression (lineaire_regressie.m) across Series 2–4 yielding k = 1.97 N·m/rad and Adjusted R² = 0.98.',
            width: 1531,
            height: 986,
            surface: 'light',
          },
        ],
      },
      {
        id: 'current-prototype-and-next-milestones',
        heading: 'Post-TZ3 Prototype Status & Upcoming Milestones',
        paragraphs: [
          'Through November 19, 2026, Team 214 has assembled the physical laser-cut 4 mm MDF prototype in the KU Leuven P&O studio (TZ3, Nov 10), finalized the 4-prong 3D-printed ball cradle houder_bal.stl (Nov 17), completed Experiment 1 / Verslag 1, and produced full Blender cycle renders and animation.',
          'Remaining Fall 2026 milestones still ahead include Experiment 2 (2.4 m drop test with Δt = 0.0001 s Euler integration in luchtweerstand experiment.xlsx to fit drag coefficient Cd), Verslag 2 and Verslag 3 submissions, Experiment 3 projectile video tracking, the A0 poster and isometric drawing, and final Quadrivium relay scoring.',
        ],
        figures: [
          {
            src: '/assets/images/projects/team-214/prototype-studio.jpg',
            alt: 'Physical laser-cut 4 mm MDF Team 214 catapult prototype assembled on a KU Leuven P&O studio workbench',
            caption:
              'Physical laser-cut 4 mm MDF prototype assembled in the KU Leuven P&O studio following TZ3 (November 10, 2026).',
            width: 1600,
            height: 1200,
            surface: 'neutral',
          },
          {
            src: '/assets/images/projects/team-214/prototype-isometric.jpg',
            alt: 'Isometric studio view of the physical Team 214 MDF prototype showing twin carbon rods, slotted latch, and basket tower',
            caption:
              'Isometric studio photo of the assembled MDF prototype showing the carbon-rod clamp, slotted latch tower, and suspended basket frame.',
            width: 1200,
            height: 1600,
            surface: 'neutral',
          },
        ],
      },
    ],
    sourcesNote:
      'Verified from KU Leuven team-214 repo (through 2026-11-19): opgave-PO1a-2026-babybalestafette.pdf, verslag-1_v3(def).pdf, lineaire_regressie.m, Testopstelling Veer/README.md, and numerieke gegevens.txt.',
  },
];

export function getProjectBySlug(slug: string): ProjectData | undefined {
  return PROJECTS.find((project) => project.slug === slug);
}

export function isProjectSlug(value: string): value is ProjectSlug {
  return PROJECTS.some((project) => project.slug === value);
}
