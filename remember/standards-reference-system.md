# Standards Reference System

This document outlines the implementation approach for the Standards Reference System, a core component of the Energy Audit Platform that provides access to relevant electrical, energy efficiency, and building standards.

## 1. Overview

The Standards Reference System will serve as a comprehensive knowledge base for auditors, providing contextual access to relevant codes, standards, and best practices. It will enable users to:

- Access and search standards content
- Check compliance against requirements
- Link findings to specific code sections
- Generate documentation for regulatory submissions
- Access educational resources related to standards implementation

## 2. Core Standards to Include

### 2.1 Philippine Electrical Code (PEC)
- Latest edition (2017)
- All relevant sections for educational facilities
- Focus on:
  - Article 1.0: General Requirements
  - Article 2.0: Wiring and Protection
  - Article 3.0: Wiring Methods and Materials
  - Article 4.0: Equipment for General Use
  - Article 5.0: Special Occupancies
  - Article 6.0: Special Equipment
  - Article 7.0: Special Conditions
  - Article 8.0: Communications Systems
  - Article 9.0: Tables and Examples

### 2.2 Energy Efficiency Standards
- Philippine Energy Efficiency Project (PEEP) guidelines
- Department of Energy (DOE) standards
- ASHRAE 90.1: Energy Standard for Buildings
- Philippine Green Building Code

### 2.3 Illumination Standards
- PEC Rule 1075: Illumination Requirements
- DepEd standards for educational facilities
- Illuminating Engineering Society (IES) recommendations
- ASHRAE/IES 90.1 Lighting Requirements

### 2.4 Power Quality Standards
- IEEE 519-2014: Harmonic Control in Electrical Power Systems
- IEEE 1159-2019: Monitoring Electric Power Quality
- Philippine Distribution Code
- IEC 61000 series: Electromagnetic Compatibility

### 2.5 Safety Standards
- Occupational Safety and Health Standards (OSHS)
- Fire Code of the Philippines
- National Building Code of the Philippines

## 3. System Architecture

### 3.1 Database Structure

```
standards_db
│
├── standards
│   ├── id
│   ├── code_name (e.g., "PEC 2017")
│   ├── full_name
│   ├── version
│   ├── issuing_body
│   ├── effective_date
│   └── description
│
├── sections
│   ├── id
│   ├── standard_id (foreign key to standards)
│   ├── section_number
│   ├── title
│   ├── parent_section_id (for hierarchical structure)
│   ├── content
│   ├── has_tables (boolean)
│   └── has_figures (boolean)
│
├── tables
│   ├── id
│   ├── section_id (foreign key to sections)
│   ├── table_number
│   ├── title
│   ├── content (JSON structure or HTML)
│   └── notes
│
├── figures
│   ├── id
│   ├── section_id (foreign key to sections)
│   ├── figure_number
│   ├── title
│   ├── image_path
│   └── caption
│
├── keywords
│   ├── id
│   ├── keyword
│   └── weight
│
├── section_keywords
│   ├── section_id (foreign key to sections)
│   └── keyword_id (foreign key to keywords)
│
├── compliance_requirements
│   ├── id
│   ├── section_id (foreign key to sections)
│   ├── requirement_type (e.g., "mandatory", "prescriptive", "performance")
│   ├── description
│   ├── verification_method
│   └── severity (e.g., "critical", "major", "minor")
│
└── educational_resources
    ├── id
    ├── section_id (foreign key to sections)
    ├── resource_type (e.g., "video", "article", "case_study")
    ├── title
    ├── description
    ├── url
    └── tags
```

### 3.2 API Structure

```javascript
// Standards API endpoints
const standardsApiEndpoints = {
  // Standards retrieval
  getStandardsList: '/api/standards',
  getStandardById: '/api/standards/:id',
  
  // Sections retrieval
  getSectionsByStandardId: '/api/standards/:id/sections',
  getSectionById: '/api/sections/:id',
  getSectionByNumber: '/api/standards/:standardId/sections/:sectionNumber',
  
  // Search functionality
  searchStandards: '/api/search/standards',
  searchSections: '/api/search/sections',
  
  // Compliance checking
  checkCompliance: '/api/compliance/check',
  getComplianceRequirements: '/api/sections/:id/compliance-requirements',
  
  // Educational resources
  getResourcesBySection: '/api/sections/:id/resources',
  getAllResources: '/api/resources'
};
```

## 4. Core Features

### 4.1 Standards Browser

#### Hierarchical Navigation
- Browse standards by category
- Navigate through hierarchical structure (chapters, articles, sections)
- Expand/collapse sections for easy navigation
- Breadcrumb navigation for current location

#### Search Capabilities
- Full-text search across all standards
- Keyword-based search with relevance ranking
- Filters for standard type, category, and applicability
- Recent searches and bookmarks

#### Implementation Example
```javascript
// Component for standards browser
function StandardsBrowser({ selectedStandard, onStandardSelect, onSectionSelect }) {
  const [standards, setStandards] = useState([]);
  const [sections, setSections] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Fetch standards on component mount
  useEffect(() => {
    fetchStandards();
  }, []);
  
  // Fetch sections when standard is selected
  useEffect(() => {
    if (selectedStandard) {
      fetchSectionsByStandardId(selectedStandard.id);
    }
  }, [selectedStandard]);
  
  // Handle search
  useEffect(() => {
    if (searchQuery.length > 2) {
      setIsSearching(true);
      const delaySearch = setTimeout(() => {
        searchStandards(searchQuery);
      }, 500);
      
      return () => clearTimeout(delaySearch);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  }, [searchQuery]);
  
  // Fetch all standards
  const fetchStandards = async () => {
    try {
      const response = await api.get('/api/standards');
      setStandards(response.data);
    } catch (error) {
      console.error('Error fetching standards:', error);
    }
  };
  
  // Fetch sections by standard ID
  const fetchSectionsByStandardId = async (standardId) => {
    try {
      const response = await api.get(`/api/standards/${standardId}/sections`);
      setSections(response.data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };
  
  // Search standards and sections
  const searchStandards = async (query) => {
    try {
      const response = await api.get('/api/search/sections', {
        params: { q: query }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching standards:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  return (
    <div className="standards-browser">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search standards..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {isSearching && <span className="loading-indicator">Searching...</span>}
      </div>
      
      {searchQuery.length > 2 ? (
        <SearchResults 
          results={searchResults} 
          onSectionSelect={onSectionSelect} 
        />
      ) : (
        <>
          <StandardsList 
            standards={standards} 
            selectedStandard={selectedStandard}
            onStandardSelect={onStandardSelect} 
          />
          
          {selectedStandard && (
            <SectionsList 
              sections={sections} 
              onSectionSelect={onSectionSelect} 
            />
          )}
        </>
      )}
    </div>
  );
}
```

### 4.2 Section Viewer

#### Content Display
- Clean, readable presentation of standard text
- Proper formatting for tables and figures
- Syntax highlighting for code examples
- Print-friendly view

#### Interactive Elements
- Expandable definitions for technical terms
- Cross-references to related sections
- Bookmarking capability
- Annotation and highlighting tools

#### Implementation Example
```javascript
// Component for viewing a specific section
function SectionViewer({ section, relatedSections }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  
  // Check if section is bookmarked on load
  useEffect(() => {
    const isBookmarked = checkIfBookmarked(section.id);
    setBookmarked(isBookmarked);
    
    // Load any saved annotations
    const savedAnnotations = loadAnnotations(section.id);
    if (savedAnnotations) {
      setAnnotations(savedAnnotations);
    }
  }, [section]);
  
  // Toggle bookmark status
  const toggleBookmark = () => {
    if (bookmarked) {
      removeBookmark(section.id);
    } else {
      addBookmark(section.id);
    }
    setBookmarked(!bookmarked);
  };
  
  // Add annotation
  const addAnnotation = (text, selectionRange) => {
    const newAnnotation = {
      id: generateUniqueId(),
      text,
      range: selectionRange,
      createdAt: new Date().toISOString()
    };
    
    const updatedAnnotations = [...annotations, newAnnotation];
    setAnnotations(updatedAnnotations);
    saveAnnotations(section.id, updatedAnnotations);
  };
  
  return (
    <div className="section-viewer">
      <div className="section-header">
        <h2>{section.section_number} {section.title}</h2>
        <div className="section-actions">
          <button 
            className={`bookmark-button ${bookmarked ? 'bookmarked' : ''}`}
            onClick={toggleBookmark}
          >
            {bookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>
          <button className="print-button">Print</button>
        </div>
      </div>
      
      <div className="section-content">
        <ContentRenderer 
          content={section.content} 
          annotations={annotations}
          onAddAnnotation={addAnnotation}
        />
      </div>
      
      {section.has_tables && (
        <div className="section-tables">
          <h3>Tables</h3>
          <TablesList tables={section.tables} />
        </div>
      )}
      
      {section.has_figures && (
        <div className="section-figures">
          <h3>Figures</h3>
          <FiguresList figures={section.figures} />
        </div>
      )}
      
      {relatedSections.length > 0 && (
        <div className="related-sections">
          <h3>Related Sections</h3>
          <ul>
            {relatedSections.map(relatedSection => (
              <li key={relatedSection.id}>
                <a href={`/sections/${relatedSection.id}`}>
                  {relatedSection.section_number}: {relatedSection.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### 4.3 Compliance Checker

#### Compliance Rules Engine
- Structured representation of code requirements
- Automated validation against input data
- Severity classification of violations
- Recommendation generation for non-compliant items

#### Integration with Calculations
- Automatic compliance checking for calculation results
- Real-time feedback during data entry
- Visual indicators for compliant/non-compliant values
- Documentation of compliance status

#### Implementation Example
```javascript
// Compliance checking service
class ComplianceService {
  // Check compliance for a specific calculation result
  async checkCompliance(calculationType, calculationData) {
    try {
      const response = await api.post('/api/compliance/check', {
        calculationType,
        calculationData
      });
      
      return response.data;
    } catch (error) {
      console.error('Error checking compliance:', error);
      throw error;
    }
  }
  
  // Get compliance requirements for a specific section
  async getComplianceRequirements(sectionId) {
    try {
      const response = await api.get(`/api/sections/${sectionId}/compliance-requirements`);
      return response.data;
    } catch (error) {
      console.error('Error fetching compliance requirements:', error);
      throw error;
    }
  }
  
  // Generate compliance report
  async generateComplianceReport(auditId) {
    try {
      const response = await api.get(`/api/audits/${auditId}/compliance-report`);
      return response.data;
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }
  
  // Evaluate a single rule
  evaluateRule(rule, data) {
    // Simple rule evaluation example
    switch (rule.operator) {
      case 'equals':
        return data[rule.field] === rule.value;
      case 'not_equals':
        return data[rule.field] !== rule.value;
      case 'greater_than':
        return data[rule.field] > rule.value;
      case 'less_than':
        return data[rule.field] < rule.value;
      case 'in_range':
        return data[rule.field] >= rule.range.min && data[rule.field] <= rule.range.max;
      case 'contains':
        return Array.isArray(data[rule.field]) && data[rule.field].includes(rule.value);
      default:
        console.warn(`Unknown operator: ${rule.operator}`);
        return false;
    }
  }
}
```

### 4.4 Educational Resources

#### Resource Types
- Video tutorials
- Case studies
- Implementation guides
- Best practice documents
- Technical papers

#### Contextual Learning
- Resources linked to specific code sections
- Difficulty levels (beginner to advanced)
- Practical examples of implementation
- Quiz/assessment tools for knowledge verification

#### Implementation Example
```javascript
// Component for displaying educational resources
function EducationalResources({ sectionId }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: 'all',
    difficulty: 'all'
  });
  
  // Fetch resources on component mount
  useEffect(() => {
    fetchResources();
  }, [sectionId]);
  
  // Fetch resources for the current section
  const fetchResources = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/sections/${sectionId}/resources`);
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter resources based on current filter
  const filteredResources = resources.filter(resource => {
    if (filter.type !== 'all' && resource.resource_type !== filter.type) {
      return false;
    }
    
    if (filter.difficulty !== 'all' && resource.difficulty !== filter.difficulty) {
      return false;
    }
    
    return true;
  });
  
  return (
    <div className="educational-resources">
      <h3>Educational Resources</h3>
      
      <div className="resource-filters">
        <select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
        >
          <option value="all">All Types</option>
          <option value="video">Videos</option>
          <option value="article">Articles</option>
          <option value="case_study">Case Studies</option>
          <option value="guide">Implementation Guides</option>
        </select>
        
        <select
          value={filter.difficulty}
          onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      
      {loading ? (
        <div className="loading">Loading resources...</div>
      ) : filteredResources.length > 0 ? (
        <div className="resource-list">
          {filteredResources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <div className="no-resources">
          No resources found matching the current filters.
        </div>
      )}
    </div>
  );
}

// Component for individual resource card
function ResourceCard({ resource }) {
  return (
    <div className={`resource-card ${resource.resource_type}`}>
      <div className="resource-type-badge">{resource.resource_type}</div>
      
      <h4>{resource.title}</h4>
      <p>{resource.description}</p>
      
      <div className="resource-meta">
        {resource.difficulty && (
          <span className={`difficulty-badge ${resource.difficulty}`}>
            {resource.difficulty}
          </span>
        )}
        
        {resource.duration && (
          <span className="duration">{resource.duration}</span>
        )}
      </div>
      
      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-link">
        View Resource
      </a>
    </div>
  );
}
```

## 5. Integration with Audit Workflow

### 5.1 Contextual Standards Access

#### In-Context References
- Access relevant standards directly from calculation forms
- Hover tooltips with code snippets
- Quick links to full section content
- Visual indicators for compliance status

#### Implementation Example
```javascript
// Component for in-context standards reference
function ContextualStandardReference({ fieldName, standardReference }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [standardContent, setStandardContent] = useState(null);
  
  // Fetch standard content when tooltip is shown
  useEffect(() => {
    if (showTooltip && standardReference && !standardContent) {
      fetchStandardContent();
    }
  }, [showTooltip, standardReference]);
  
  // Fetch the referenced standard content
  const fetchStandardContent = async () => {
    try {
      const response = await api.get(`/api/sections/${standardReference.sectionId}`);
      setStandardContent(response.data);
    } catch (error) {
      console.error('Error fetching standard content:', error);
    }
  };
  
  // Handle mouse events for tooltip positioning
  const handleMouseEnter = (event) => {
    setTooltipPosition({
      x: event.clientX,
      y: event.clientY
    });
    setShowTooltip(true);
  };
  
  const handleMouseLeave = () => {
    setShowTooltip(false);
  };
  
  return (
    <div className="contextual-reference">
      <span className="field-name">{fieldName}</span>
      
      {standardReference && (
        <span 
          className="standard-reference-indicator"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <i className="icon-info-circle"></i>
        </span>
      )}
      
      {showTooltip && standardReference && (
        <div 
          className="standard-tooltip"
          style={{
            top: tooltipPosition.y + 10,
            left: tooltipPosition.x + 10
          }}
        >
          <div className="tooltip-header">
            <span className="standard-reference">
              {standardReference.standardCode} {standardReference.sectionNumber}
            </span>
            <span className="tooltip-title">{standardReference.title}</span>
          </div>
          
          <div className="tooltip-content">
            {standardContent ? (
              <div className="standard-snippet">
                {standardContent.snippet || standardContent.content.substring(0, 150) + '...'}
              </div>
            ) : (
              <div className="loading">Loading...</div>
            )}
          </div>
          
          <a 
            href={`/standards/view/${standardReference.sectionId}`} 
            target="_blank"
            className="view-full-link"
          >
            View Full Section
          </a>
        </div>
      )}
    </div>
  );
}
```

### 5.2 Findings Documentation

#### Standards-Linked Findings
- Associate audit findings with specific code sections
- Auto-generate code references in reports
- Severity classification based on code requirements
- Recommendation templates based on standards

#### Implementation Example
```javascript
// Component for creating a standards-linked finding
function CreateFinding({ auditId, onSave }) {
  const [finding, setFinding] = useState({
    title: '',
    description: '',
    location: '',
    severity: 'minor',
    standardReferences: [],
    recommendations: '',
    images: []
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Handle search for standards
  useEffect(() => {
    if (searchQuery.length > 2) {
      setIsSearching(true);
      const delaySearch = setTimeout(() => {
        searchStandards(searchQuery);
      }, 500);
      
      return () => clearTimeout(delaySearch);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  }, [searchQuery]);
  
  // Search standards
  const searchStandards = async (query) => {
    try {
      const response = await api.get('/api/search/sections', {
        params: { q: query }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching standards:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Add standard reference to finding
  const addStandardReference = (standard) => {
    if (!finding.standardReferences.some(ref => ref.id === standard.id)) {
      setFinding({
        ...finding,
        standardReferences: [...finding.standardReferences, standard]
      });
    }
    
    // Clear search
    setSearchQuery('');
    setSearchResults([]);
  };
  
  // Remove standard reference
  const removeStandardReference = (standardId) => {
    setFinding({
      ...finding,
      standardReferences: finding.standardReferences.filter(ref => ref.id !== standardId)
    });
  };
  
  // Generate recommendations based on selected standards
  const generateRecommendations = async () => {
    if (finding.standardReferences.length === 0) {
      alert('Please select at least one standard reference first.');
      return;
    }
    
    try {
      const response = await api.post('/api/findings/generate-recommendations', {
        standardReferences: finding.standardReferences.map(ref => ref.id)
      });
      
      setFinding({
        ...finding,
        recommendations: response.data.recommendations
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
  };
  
  // Save the finding
  const saveFinding = async () => {
    try {
      const response = await api.post(`/api/audits/${auditId}/findings`, finding);
      onSave(response.data);
    } catch (error) {
      console.error('Error saving finding:', error);
    }
  };
  
  return (
    <div className="create-finding">
      <h2>Create New Finding</h2>
      
      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          value={finding.title}
          onChange={(e) => setFinding({ ...finding, title: e.target.value })}
        />
      </div>
      
      <div className="form-group">
        <label>Description</label>
        <textarea
          value={finding.description}
          onChange={(e) => setFinding({ ...finding, description: e.target.value })}
          rows={4}
        />
      </div>
      
      <div className="form-group">
        <label>Location</label>
        <input
          type="text"
          value={finding.location}
          onChange={(e) => setFinding({ ...finding, location: e.target.value })}
        />
      </div>
      
      <div className="form-group">
        <label>Severity</label>
        <select
          value={finding.severity}
          onChange={(e) => setFinding({ ...finding, severity: e.target.value })}
        >
          <option value="critical">Critical</option>
          <option value="major">Major</option>
          <option value="minor">Minor</option>
          <option value="informational">Informational</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>Standard References</label>
        <div className="search-standards">
          <input
            type="text"
            placeholder="Search standards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          {isSearching && <span className="loading-indicator">Searching...</span>}
          
          {searchResults.length > 0 && (
            <ul className="search-results">
              {searchResults.map(result => (
                <li key={result.id} onClick={() => addStandardReference(result)}>
                  <span className="section-number">{result.section_number}</span>
                  <span className="section-title">{result.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="selected-references">
          {finding.standardReferences.map(ref => (
            <div key={ref.id} className="reference-tag">
              <span>{ref.section_number}: {ref.title}</span>
              <button onClick={() => removeStandardReference(ref.id)}>×</button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="form-group">
        <label>Recommendations</label>
        <div className="recommendations-actions">
          <button onClick={generateRecommendations}>
            Generate Recommendations
          </button>
        </div>
        <textarea
          value={finding.recommendations}
          onChange={(e) => setFinding({ ...finding, recommendations: e.target.value })}
          rows={4}
        />
      </div>
      
      <div className="form-actions">
        <button className="save-button" onClick={saveFinding}>
          Save Finding
        </button>
      </div>
    </div>
  );
}
```

## 6. Implementation Roadmap

### 6.1 Phase 1: Database Setup and Content Import (3-4 weeks)
- Design and implement database schema
- Import PEC content (focus on most relevant sections first)
- Create basic search indexing
- Develop API endpoints for content retrieval

### 6.2 Phase 2: Core Browser and Viewer (3-4 weeks)
- Implement standards browser component
- Develop section viewer with proper formatting
- Create search functionality
- Implement bookmarking and basic annotations

### 6.3 Phase 3: Compliance Engine (4-5 weeks)
- Design compliance rules structure
- Implement rules engine
- Create compliance checking API
- Integrate with calculation modules
- Develop compliance reporting

### 6.4 Phase 4: Educational Resources (3-4 weeks)
- Design educational content structure
- Import initial educational resources
- Create resource browser component
- Implement contextual linking to standards

### 6.5 Phase 5: Integration and Refinement (3-4 weeks)
- Integrate with audit workflow
- Implement contextual standards access
- Develop findings documentation with standards linking
- Optimize performance and user experience
- Conduct user testing and refinement

## 7. Technical Considerations

### 7.1 Content Management
- Regular updates for standards changes
- Version control for standards content
- Content approval workflow
- Structured format for easy parsing and searching

### 7.2 Performance Optimization
- Efficient search indexing
- Caching strategies for frequently accessed content
- Lazy loading for large documents
- Optimized database queries

### 7.3 Offline Access
- Progressive Web App capabilities
- Local storage of frequently accessed standards
- Synchronization when online
- Offline annotations and bookmarks

### 7.4 Security Considerations
- Access control for premium content
- Content encryption for sensitive standards
- Audit logging for compliance activities
- Secure API access 