import { query } from '../../config/database';

/**
 * Seed Standards data
 */
export async function seedStandards() {
  try {
    console.log('Seeding standards data...');

    // Check if standards table already has data
    const existingStandards = await query('SELECT COUNT(*) as count FROM standards');
    if (existingStandards[0].count > 0) {
      console.log('Standards data already exists, skipping seed');
      return;
    }

    // Insert standards
    const standards = [
      {
        code_name: 'PEC 2017', 
        full_name: 'Philippine Electrical Code', 
        version: '2017', 
        issuing_body: 'Board of Electrical Engineering', 
        effective_date: '2017-01-01',
        description: 'The Philippine Electrical Code (PEC) is the official electrical code of the Philippines, containing requirements for electrical safety in buildings and other structures.'
      },
      {
        code_name: 'PEEP', 
        full_name: 'Philippine Energy Efficiency Project', 
        version: '2.0', 
        issuing_body: 'Department of Energy (DOE)', 
        effective_date: '2018-05-15',
        description: 'The Philippine Energy Efficiency Project (PEEP) provides guidelines for energy efficiency in buildings and facilities across the Philippines.'
      },
      {
        code_name: 'PGBC', 
        full_name: 'Philippine Green Building Code', 
        version: '2015', 
        issuing_body: 'Department of Public Works and Highways', 
        effective_date: '2015-06-22',
        description: 'The Philippine Green Building Code (PGBC) provides a framework for environmentally responsible construction in the Philippines.'
      },
      {
        code_name: 'ASHRAE 90.1', 
        full_name: 'Energy Standard for Buildings Except Low-Rise Residential Buildings', 
        version: '2019', 
        issuing_body: 'ASHRAE', 
        effective_date: '2019-10-31',
        description: 'ASHRAE 90.1 provides minimum requirements for energy-efficient design of buildings, offering guidelines for architects and engineers.'
      },
      {
        code_name: 'IEEE 519', 
        full_name: 'IEEE Recommended Practice for Harmonic Control in Electrical Power Systems', 
        version: '2014', 
        issuing_body: 'IEEE', 
        effective_date: '2014-06-11',
        description: 'IEEE 519-2014 provides guidelines for harmonic control in power systems with a focus on the point of common coupling between utilities and customers.'
      }
    ];

    // Array to hold standard IDs
    const standardIds: Record<string, number> = {};
    
    // Insert standards
    for (const standard of standards) {
      const result = await query(
        `INSERT INTO standards (code_name, full_name, version, issuing_body, effective_date, description)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          standard.code_name,
          standard.full_name,
          standard.version,
          standard.issuing_body,
          standard.effective_date,
          standard.description
        ]
      );

      // MySQL returns insertId directly in the result object
      standardIds[standard.code_name] = result.insertId;
    }

    // Define PEC sections
    const pecSections = [
      {
        standard_id: standardIds['PEC 2017'],
        section_number: '1.0',
        title: 'Introduction',
        parent_section_id: null,
        content: '<p>The Philippine Electrical Code (PEC) is adopted from the National Electrical Code (NEC) with modifications to suit local conditions.</p><p>This Code covers the installation of electrical conductors, equipment, and raceways; signaling and communications conductors, equipment, and raceways; and optical fiber cables and raceways.</p>',
        has_tables: false,
        has_figures: false
      },
      {
        standard_id: standardIds['PEC 2017'],
        section_number: '2.0',
        title: 'General Requirements',
        parent_section_id: null,
        content: '<p>The provisions in this section provide the general requirements for electrical systems and installations.</p>',
        has_tables: false,
        has_figures: false
      },
      {
        standard_id: standardIds['PEC 2017'],
        section_number: '2.1',
        title: 'Scope',
        parent_section_id: null, // Will be updated after insert
        content: '<p>The provisions of this section apply to electrical systems installation requirements.</p>',
        has_tables: false,
        has_figures: false
      },
      {
        standard_id: standardIds['PEC 2017'],
        section_number: '2.2',
        title: 'Approval',
        parent_section_id: null, // Will be updated after insert
        content: '<p>All electrical equipment shall be approved before installation.</p><p>Approval for equipment may be evidenced by listing and labeling by a nationally recognized testing laboratory (NRTL).</p>',
        has_tables: false,
        has_figures: false
      },
      {
        standard_id: standardIds['PEC 2017'],
        section_number: '3.0',
        title: 'Wiring and Protection',
        parent_section_id: null,
        content: '<p>This article covers general requirements for wiring methods and materials used in electrical installations.</p><p>All conductors must be properly protected against physical damage and environmental hazards.</p>',
        has_tables: true,
        has_figures: true
      },
      {
        standard_id: standardIds['PEC 2017'],
        section_number: '3.1',
        title: 'Conductor Requirements',
        parent_section_id: null, // Will be updated after insert
        content: '<p>Conductors shall be selected to ensure adequate ampacity, voltage rating, and insulation for the intended application.</p><p>The minimum conductor size for general-purpose branch circuits shall be 2.0 mm² (14 AWG) copper or equivalent.</p>',
        has_tables: true,
        has_figures: false
      },
      {
        standard_id: standardIds['PEC 2017'],
        section_number: '3.2',
        title: 'Grounding and Bonding',
        parent_section_id: null, // Will be updated after insert
        content: '<p>Grounding and bonding shall be provided to establish an effective path for fault current and to limit voltage imposed by lightning or unintentional contact with higher voltage lines.</p><p>All metallic enclosures and raceways containing electrical conductors must be properly bonded and grounded.</p>',
        has_tables: false,
        has_figures: true
      }
    ];

    // Define PEEP sections
    const peepSections = [
      {
        standard_id: standardIds['PEEP'],
        section_number: '1.0',
        title: 'Introduction',
        parent_section_id: null,
        content: '<p>The Philippine Energy Efficiency Project (PEEP) aims to improve energy efficiency in the country by promoting energy-efficient technologies and practices.</p>',
        has_tables: false,
        has_figures: false
      },
      {
        standard_id: standardIds['PEEP'],
        section_number: '2.0',
        title: 'Lighting Efficiency',
        parent_section_id: null,
        content: '<p>This section covers requirements for energy-efficient lighting systems in buildings.</p><p>Lighting systems should be designed to provide adequate illumination while minimizing energy consumption.</p>',
        has_tables: true,
        has_figures: false
      },
      {
        standard_id: standardIds['PEEP'],
        section_number: '3.0',
        title: 'HVAC Systems',
        parent_section_id: null,
        content: '<p>This section provides guidelines for energy-efficient heating, ventilation, and air conditioning (HVAC) systems.</p>',
        has_tables: true,
        has_figures: true
      }
    ];

    // Define ASHRAE sections
    const ashraeGreenSections = [
      {
        standard_id: standardIds['ASHRAE 90.1'],
        section_number: '1.0',
        title: 'Purpose',
        parent_section_id: null,
        content: '<p>The purpose of this standard is to establish the minimum energy efficiency requirements of buildings, other than low-rise residential buildings.</p>',
        has_tables: false,
        has_figures: false
      },
      {
        standard_id: standardIds['ASHRAE 90.1'],
        section_number: '5.0',
        title: 'Building Envelope',
        parent_section_id: null,
        content: '<p>This section provides requirements for the building envelope, including walls, roofs, floors, doors, and fenestration.</p>',
        has_tables: true,
        has_figures: true
      },
      {
        standard_id: standardIds['ASHRAE 90.1'],
        section_number: '6.0',
        title: 'HVAC',
        parent_section_id: null,
        content: '<p>This section provides requirements for heating, ventilating, and air conditioning systems and equipment.</p>',
        has_tables: true,
        has_figures: false
      },
      {
        standard_id: standardIds['ASHRAE 90.1'],
        section_number: '9.0',
        title: 'Lighting',
        parent_section_id: null,
        content: '<p>This section provides requirements for lighting systems, including controls and power allowances.</p><p>The power allowances represent the maximum lighting power to be used for a given space or building.</p>',
        has_tables: true,
        has_figures: false
      }
    ];

    // Define IEEE sections
    const ieeeSections = [
      {
        standard_id: standardIds['IEEE 519'],
        section_number: '1.0',
        title: 'Overview',
        parent_section_id: null,
        content: '<p>This recommended practice establishes goals for the design of electrical systems that include both linear and nonlinear loads.</p>',
        has_tables: false,
        has_figures: false
      },
      {
        standard_id: standardIds['IEEE 519'],
        section_number: '2.0',
        title: 'Definitions',
        parent_section_id: null,
        content: '<p>This section provides definitions of terms used in the context of harmonic control in power systems.</p>',
        has_tables: false,
        has_figures: false
      },
      {
        standard_id: standardIds['IEEE 519'],
        section_number: '5.0',
        title: 'Recommended Harmonic Limits',
        parent_section_id: null,
        content: '<p>This section provides recommended limits for harmonic current distortion and voltage distortion at the point of common coupling (PCC).</p>',
        has_tables: true,
        has_figures: true
      }
    ];

    // All sections combined
    const allSections = [
      ...pecSections,
      ...peepSections,
      ...ashraeGreenSections,
      ...ieeeSections
    ];

    // Define the type for sectionIds
    const sectionIds: Record<string, number> = {};
    
    // Insert sections
    for (const section of allSections) {
      const result = await query(
        `INSERT INTO standard_sections (
          standard_id, 
          section_number, 
          title, 
          parent_section_id, 
          content, 
          has_tables, 
          has_figures
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          section.standard_id,
          section.section_number,
          section.title,
          section.parent_section_id,
          section.content,
          section.has_tables,
          section.has_figures
        ]
      );
      
      const key = `${section.standard_id}-${section.section_number}`;
      sectionIds[key] = result.insertId;
    }

    // Update parent relationships for PEC
    await query('UPDATE standard_sections SET parent_section_id = ? WHERE id = ?', [
      sectionIds[`${standardIds['PEC 2017']}-2.0`], sectionIds[`${standardIds['PEC 2017']}-2.1`]
    ]);
    
    await query('UPDATE standard_sections SET parent_section_id = ? WHERE id = ?', [
      sectionIds[`${standardIds['PEC 2017']}-2.0`], sectionIds[`${standardIds['PEC 2017']}-2.2`]
    ]);

    await query('UPDATE standard_sections SET parent_section_id = ? WHERE id = ?', [
      sectionIds[`${standardIds['PEC 2017']}-3.0`], sectionIds[`${standardIds['PEC 2017']}-3.1`]
    ]);

    await query('UPDATE standard_sections SET parent_section_id = ? WHERE id = ?', [
      sectionIds[`${standardIds['PEC 2017']}-3.0`], sectionIds[`${standardIds['PEC 2017']}-3.2`]
    ]);

    // Insert a table for section 3.0 of PEC
    const tableContent = JSON.stringify({
      headers: ['Size Range', 'Conductors', 'Maximum Number Per Conduit'],
      rows: [
        ['14-10', '1', '12'],
        ['14-10', '2', '9'],
        ['14-10', '3', '7'],
        ['8-6', '1', '4'],
        ['8-6', '2', '3'],
        ['8-6', '3', '2']
      ]
    });

    await query(
      `INSERT INTO standard_tables (
        section_id, 
        table_number, 
        title, 
        content, 
        notes
      )
      VALUES (?, ?, ?, ?, ?)`,
      [
        sectionIds[`${standardIds['PEC 2017']}-3.0`],
        '3.1',
        'Maximum Allowable Number of Conductors',
        tableContent,
        'This table shows the maximum number of conductors permitted in a conduit based on size.'
      ]
    );

    // Insert a table for section 3.1 of PEC
    const tableContent2 = JSON.stringify({
      headers: ['Conductor Size (AWG/kcmil)', 'Ampacity (60°C)', 'Ampacity (75°C)', 'Ampacity (90°C)'],
      rows: [
        ['14', '15', '20', '25'],
        ['12', '20', '25', '30'],
        ['10', '30', '35', '40'],
        ['8', '40', '50', '55'],
        ['6', '55', '65', '75'],
        ['4', '70', '85', '95']
      ]
    });

    await query(
      `INSERT INTO standard_tables (
        section_id, 
        table_number, 
        title, 
        content, 
        notes
      )
      VALUES (?, ?, ?, ?, ?)`,
      [
        sectionIds[`${standardIds['PEC 2017']}-3.1`],
        '3.1.1',
        'Allowable Ampacities of Insulated Copper Conductors',
        tableContent2,
        'The ampacity values shown are based on not more than three current-carrying conductors in a raceway or cable.'
      ]
    );

    // Insert a figure for section 3.0 of PEC
    await query(
      `INSERT INTO standard_figures (
        section_id, 
        figure_number, 
        title, 
        image_path, 
        caption
      )
      VALUES (?, ?, ?, ?, ?)`,
      [
        sectionIds[`${standardIds['PEC 2017']}-3.0`],
        '3.1',
        'Wiring Diagram Example',
        '/images/standards/wiring-diagram-example.png',
        'Typical wiring diagram showing proper conductor installation.'
      ]
    );

    // Insert a figure for section 3.2 of PEC
    await query(
      `INSERT INTO standard_figures (
        section_id, 
        figure_number, 
        title, 
        image_path, 
        caption
      )
      VALUES (?, ?, ?, ?, ?)`,
      [
        sectionIds[`${standardIds['PEC 2017']}-3.2`],
        '3.2.1',
        'Grounding System Components',
        '/images/standards/grounding-system-components.png',
        'Illustration of typical grounding system components for a building electrical system.'
      ]
    );

    // Insert compliance requirements
    await query(
      `INSERT INTO compliance_requirements (
        section_id, 
        requirement_type, 
        description, 
        verification_method, 
        severity
      )
      VALUES (?, ?, ?, ?, ?)`,
      [
        sectionIds[`${standardIds['PEC 2017']}-3.0`],
        'mandatory',
        'All conductors must not exceed the maximum number specified in Table 3.1',
        'Visual inspection and measurement',
        'critical'
      ]
    );

    await query(
      `INSERT INTO compliance_requirements (
        section_id, 
        requirement_type, 
        description, 
        verification_method, 
        severity
      )
      VALUES (?, ?, ?, ?, ?)`,
      [
        sectionIds[`${standardIds['PEC 2017']}-3.2`],
        'mandatory',
        'All non-current-carrying metal parts of electrical equipment shall be bonded and grounded',
        'Continuity testing and visual inspection',
        'critical'
      ]
    );

    await query(
      `INSERT INTO compliance_requirements (
        section_id, 
        requirement_type, 
        description, 
        verification_method, 
        severity
      )
      VALUES (?, ?, ?, ?, ?)`,
      [
        sectionIds[`${standardIds['ASHRAE 90.1']}-9.0`],
        'prescriptive',
        'The interior lighting power allowance shall not exceed the values specified in Table 9.5.1',
        'Lighting power density calculations and measurements',
        'major'
      ]
    );

    // Insert educational resources
    await query(
      `INSERT INTO educational_resources (
        section_id, 
        resource_type, 
        title, 
        description, 
        url, 
        difficulty, 
        duration, 
        tags
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sectionIds[`${standardIds['PEC 2017']}-3.0`],
        'video',
        'Understanding PEC Wiring Requirements',
        'A comprehensive guide to interpreting and applying the wiring requirements in the PEC.',
        'https://example.com/pec-wiring-guide',
        'intermediate',
        '45 minutes',
        'wiring,protection,conductors'
      ]
    );

    await query(
      `INSERT INTO educational_resources (
        section_id, 
        resource_type, 
        title, 
        description, 
        url, 
        difficulty, 
        duration, 
        tags
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sectionIds[`${standardIds['PEC 2017']}-3.2`],
        'article',
        'Grounding and Bonding Best Practices',
        'Learn the best practices for implementing effective grounding and bonding systems in compliance with the PEC.',
        'https://example.com/grounding-best-practices',
        'advanced',
        '20 minutes',
        'grounding,bonding,safety'
      ]
    );

    await query(
      `INSERT INTO educational_resources (
        section_id, 
        resource_type, 
        title, 
        description, 
        url, 
        difficulty, 
        duration, 
        tags
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sectionIds[`${standardIds['ASHRAE 90.1']}-9.0`],
        'webinar',
        'ASHRAE 90.1 Lighting Compliance Made Easy',
        'This webinar explains how to comply with ASHRAE 90.1 lighting requirements and optimize energy efficiency.',
        'https://example.com/ashrae-lighting-webinar',
        'beginner',
        '60 minutes',
        'lighting,energy efficiency,compliance'
      ]
    );

    await query(
      `INSERT INTO educational_resources (
        section_id, 
        resource_type, 
        title, 
        description, 
        url, 
        difficulty, 
        duration, 
        tags
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sectionIds[`${standardIds['IEEE 519']}-5.0`],
        'tool',
        'Harmonic Analysis Calculator',
        'An interactive tool to calculate harmonic distortion and check compliance with IEEE 519 limits.',
        'https://example.com/harmonic-calculator',
        'intermediate',
        'N/A',
        'harmonics,power quality,calculator'
      ]
    );

    // Add keywords and associate with sections
    const keywords = [
      { keyword: 'wiring', weight: 3 },
      { keyword: 'conductors', weight: 2 },
      { keyword: 'grounding', weight: 3 },
      { keyword: 'bonding', weight: 2 },
      { keyword: 'ampacity', weight: 2 },
      { keyword: 'lighting', weight: 3 },
      { keyword: 'energy efficiency', weight: 3 },
      { keyword: 'harmonics', weight: 3 },
      { keyword: 'power quality', weight: 2 },
      { keyword: 'HVAC', weight: 3 }
    ];

    const keywordIds: Record<string, number> = {};

    for (const kw of keywords) {
      const result = await query(
        `INSERT INTO standard_keywords (keyword, weight) VALUES (?, ?)`,
        [kw.keyword, kw.weight]
      );
      keywordIds[kw.keyword] = result.insertId;
    }

    // Associate keywords with sections
    const keywordAssociations = [
      { section: `${standardIds['PEC 2017']}-3.0`, keywords: ['wiring', 'conductors'] },
      { section: `${standardIds['PEC 2017']}-3.1`, keywords: ['conductors', 'ampacity'] },
      { section: `${standardIds['PEC 2017']}-3.2`, keywords: ['grounding', 'bonding'] },
      { section: `${standardIds['ASHRAE 90.1']}-9.0`, keywords: ['lighting', 'energy efficiency'] },
      { section: `${standardIds['PEEP']}-2.0`, keywords: ['lighting', 'energy efficiency'] },
      { section: `${standardIds['PEEP']}-3.0`, keywords: ['HVAC', 'energy efficiency'] },
      { section: `${standardIds['IEEE 519']}-5.0`, keywords: ['harmonics', 'power quality'] }
    ];

    for (const assoc of keywordAssociations) {
      for (const keyword of assoc.keywords) {
        await query(
          `INSERT INTO section_keywords (section_id, keyword_id) VALUES (?, ?)`,
          [sectionIds[assoc.section], keywordIds[keyword]]
        );
      }
    }

    console.log('Standards data seeded successfully!');
  } catch (error) {
    console.error('Error seeding standards data:', error);
    throw error;
  }
}

// To run the seeder directly:
if (require.main === module) {
  seedStandards().then(() => {
    console.log('Standards seeding completed');
    process.exit(0);
  }).catch(error => {
    console.error('Standards seeding failed:', error);
    process.exit(1);
  });
} 