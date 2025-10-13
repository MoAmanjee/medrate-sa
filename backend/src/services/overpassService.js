import axios from 'axios';

class OverpassService {
  constructor() {
    // Use multiple Overpass API servers for better reliability
    this.overpassUrls = [
      'https://overpass-api.de/api/interpreter',
      'https://lz4.overpass-api.de/api/interpreter',
      'https://z.overpass-api.de/api/interpreter'
    ];
    this.currentUrlIndex = 0;
    this.timeout = 60000; // 60 seconds timeout
  }

  /**
   * Fetch all healthcare facilities in South Africa from OpenStreetMap
   * @returns {Promise<Array>} Array of healthcare facilities
   */
  async fetchSouthAfricanHealthcareFacilities() {
    try {
      console.log('Fetching healthcare facilities from OpenStreetMap...');
      
      // Overpass QL query to get all healthcare facilities in South Africa
      // Using bounding box approach for better performance
      const query = `
        [out:json][timeout:300];
        (
          node["amenity"~"^(hospital|clinic|doctors|dentist|pharmacy)$"](16.4699,-34.8192,32.8931,-22.1256);
          way["amenity"~"^(hospital|clinic|doctors|dentist|pharmacy)$"](16.4699,-34.8192,32.8931,-22.1256);
          relation["amenity"~"^(hospital|clinic|doctors|dentist|pharmacy)$"](16.4699,-34.8192,32.8931,-22.1256);
        );
        out center meta;
      `;

      const response = await this.makeOverpassRequest(query);

      console.log(`Fetched ${response.data.elements.length} healthcare facilities from OpenStreetMap`);
      return this.parseOverpassData(response.data.elements);
      
    } catch (error) {
      console.error('Error fetching data from Overpass API:', error.message);
      throw new Error(`Failed to fetch healthcare facilities: ${error.message}`);
    }
  }

  /**
   * Make Overpass API request with fallback servers
   * @param {string} query - Overpass QL query
   * @returns {Promise<Object>} API response
   */
  async makeOverpassRequest(query) {
    let lastError;
    
    for (let i = 0; i < this.overpassUrls.length; i++) {
      const url = this.overpassUrls[this.currentUrlIndex];
      
      try {
        console.log(`Trying Overpass API server: ${url}`);
        
        const response = await axios.post(url, query, {
          headers: {
            'Content-Type': 'text/plain',
          },
          timeout: this.timeout,
        });
        
        console.log(`Successfully connected to ${url}`);
        return response;
        
      } catch (error) {
        console.warn(`Failed to connect to ${url}: ${error.message}`);
        lastError = error;
        
        // Move to next server
        this.currentUrlIndex = (this.currentUrlIndex + 1) % this.overpassUrls.length;
        
        // If this was a rate limit or timeout error, wait before trying next server
        if (error.response?.status === 429 || error.response?.status === 504) {
          console.log('Rate limited or timeout, waiting 5 seconds before trying next server...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Parse Overpass API response data into standardized format
   * @param {Array} elements - Raw elements from Overpass API
   * @returns {Array} Parsed healthcare facilities
   */
  parseOverpassData(elements) {
    const facilities = [];
    
    for (const element of elements) {
      try {
        const facility = this.parseElement(element);
        if (facility) {
          facilities.push(facility);
        }
      } catch (error) {
        console.warn(`Error parsing element ${element.id}:`, error.message);
      }
    }

    console.log(`Successfully parsed ${facilities.length} healthcare facilities`);
    return facilities;
  }

  /**
   * Parse individual Overpass element
   * @param {Object} element - Single element from Overpass API
   * @returns {Object|null} Parsed facility or null if invalid
   */
  parseElement(element) {
    const tags = element.tags || {};
    
    // Skip if no name
    if (!tags.name) {
      return null;
    }

    // Determine facility type
    const amenity = tags.amenity;
    let type = 'CLINIC';
    
    if (amenity === 'hospital') {
      type = 'PUBLIC'; // Default to public, can be refined later
    } else if (amenity === 'clinic' || amenity === 'doctors' || amenity === 'dentist') {
      type = 'CLINIC';
    } else if (amenity === 'pharmacy') {
      type = 'PHARMACY';
    }

    // Extract coordinates
    let latitude, longitude;
    if (element.type === 'node') {
      latitude = element.lat;
      longitude = element.lon;
    } else if (element.type === 'way' || element.type === 'relation') {
      latitude = element.center?.lat;
      longitude = element.center?.lon;
    }

    if (!latitude || !longitude) {
      return null;
    }

    // Parse address components
    const address = this.parseAddress(tags);
    
    // Determine province from coordinates or address
    const province = this.determineProvince(latitude, longitude, tags['addr:province'] || tags['addr:state']);

    const facility = {
      name: tags.name.trim(),
      type: type,
      classification: this.determineClassification(tags),
      address: address.street || '',
      city: address.city || '',
      province: province,
      postalCode: address.postalCode || '',
      phone: tags.phone || tags['contact:phone'] || '',
      email: tags.email || tags['contact:email'] || '',
      website: tags.website || tags['contact:website'] || '',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      verified: true,
      autoPopulated: true,
      dataSource: 'OpenStreetMap',
      lastUpdated: new Date(),
      // Additional OSM metadata
      osmId: element.id.toString(),
      osmType: element.type,
      tags: tags
    };

    return facility;
  }

  /**
   * Parse address components from OSM tags
   * @param {Object} tags - OSM tags
   * @returns {Object} Parsed address components
   */
  parseAddress(tags) {
    return {
      street: tags['addr:street'] || tags['addr:housename'] || '',
      city: tags['addr:city'] || tags['addr:town'] || tags['addr:suburb'] || '',
      postalCode: tags['addr:postcode'] || '',
      country: tags['addr:country'] || 'ZA'
    };
  }

  /**
   * Determine South African province from coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} osmProvince - Province from OSM tags
   * @returns {string} Province name
   */
  determineProvince(lat, lon, osmProvince) {
    // If OSM has province info, use it
    if (osmProvince) {
      return this.normalizeProvinceName(osmProvince);
    }

    // Approximate province boundaries for South Africa
    const provinces = [
      { name: 'Western Cape', bounds: { north: -31.0, south: -35.0, east: 20.0, west: 16.0 } },
      { name: 'Eastern Cape', bounds: { north: -30.0, south: -35.0, east: 30.0, west: 20.0 } },
      { name: 'Northern Cape', bounds: { north: -25.0, south: -35.0, east: 20.0, west: 16.0 } },
      { name: 'Free State', bounds: { north: -26.0, south: -31.0, east: 30.0, west: 24.0 } },
      { name: 'KwaZulu-Natal', bounds: { north: -25.0, south: -31.0, east: 33.0, west: 28.0 } },
      { name: 'North West', bounds: { north: -24.0, south: -28.0, east: 28.0, west: 22.0 } },
      { name: 'Gauteng', bounds: { north: -24.0, south: -27.0, east: 29.0, west: 26.0 } },
      { name: 'Mpumalanga', bounds: { north: -23.0, south: -27.0, east: 32.0, west: 28.0 } },
      { name: 'Limpopo', bounds: { north: -22.0, south: -25.0, east: 32.0, west: 26.0 } }
    ];

    for (const province of provinces) {
      if (lat >= province.bounds.south && lat <= province.bounds.north &&
          lon >= province.bounds.west && lon <= province.bounds.east) {
        return province.name;
      }
    }

    return 'Unknown';
  }

  /**
   * Normalize province names to standard format
   * @param {string} province - Raw province name
   * @returns {string} Normalized province name
   */
  normalizeProvinceName(province) {
    const normalized = province.toLowerCase().trim();
    
    const mappings = {
      'western cape': 'Western Cape',
      'eastern cape': 'Eastern Cape',
      'northern cape': 'Northern Cape',
      'free state': 'Free State',
      'kwa-zulu natal': 'KwaZulu-Natal',
      'kwazulu natal': 'KwaZulu-Natal',
      'kzn': 'KwaZulu-Natal',
      'north west': 'North West',
      'gauteng': 'Gauteng',
      'mpumalanga': 'Mpumalanga',
      'limpopo': 'Limpopo'
    };

    return mappings[normalized] || province;
  }

  /**
   * Determine facility classification based on OSM tags
   * @param {Object} tags - OSM tags
   * @returns {string} Classification
   */
  determineClassification(tags) {
    if (tags.amenity === 'hospital') {
      if (tags.hospital_type === 'general') return 'General Hospital';
      if (tags.hospital_type === 'specialist') return 'Specialist Hospital';
      if (tags.hospital_type === 'psychiatric') return 'Psychiatric Hospital';
      if (tags.hospital_type === 'maternity') return 'Maternity Hospital';
      return 'Hospital';
    }
    
    if (tags.amenity === 'clinic') {
      return 'Medical Clinic';
    }
    
    if (tags.amenity === 'doctors') {
      return 'General Practice';
    }
    
    if (tags.amenity === 'dentist') {
      return 'Dental Practice';
    }
    
    if (tags.amenity === 'pharmacy') {
      return 'Pharmacy';
    }

    return 'Healthcare Facility';
  }

  /**
   * Fetch facilities by specific amenity type
   * @param {string} amenity - Amenity type (hospital, clinic, etc.)
   * @returns {Promise<Array>} Facilities of specified type
   */
  async fetchFacilitiesByType(amenity) {
    try {
      const query = `
        [out:json][timeout:300];
        (
          node["amenity"="${amenity}"]["addr:country"="ZA"];
          way["amenity"="${amenity}"]["addr:country"="ZA"];
          relation["amenity"="${amenity}"]["addr:country"="ZA"];
        );
        out center meta;
      `;

      const response = await this.makeOverpassRequest(query);

      return this.parseOverpassData(response.data.elements);
    } catch (error) {
      console.error(`Error fetching ${amenity} facilities:`, error.message);
      throw error;
    }
  }

  /**
   * Fetch facilities within a specific bounding box
   * @param {Object} bounds - Bounding box {north, south, east, west}
   * @param {string} amenity - Optional amenity filter
   * @returns {Promise<Array>} Facilities within bounds
   */
  async fetchFacilitiesInBounds(bounds, amenity = null) {
    try {
      const amenityFilter = amenity ? `["amenity"="${amenity}"]` : '["amenity"~"^(hospital|clinic|doctors|dentist|pharmacy)$"]';
      
      const query = `
        [out:json][timeout:300];
        (
          node${amenityFilter}(${bounds.south},${bounds.west},${bounds.north},${bounds.east});
          way${amenityFilter}(${bounds.south},${bounds.west},${bounds.north},${bounds.east});
          relation${amenityFilter}(${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        );
        out center meta;
      `;

      const response = await this.makeOverpassRequest(query);

      return this.parseOverpassData(response.data.elements);
    } catch (error) {
      console.error('Error fetching facilities in bounds:', error.message);
      throw error;
    }
  }
}

export default OverpassService;
