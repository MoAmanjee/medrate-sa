import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/hospital.dart';
import '../providers/hospital_provider.dart';

class HospitalSearchScreen extends StatefulWidget {
  const HospitalSearchScreen({Key? key}) : super(key: key);

  @override
  State<HospitalSearchScreen> createState() => _HospitalSearchScreenState();
}

class _HospitalSearchScreenState extends State<HospitalSearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedCity = 'All';
  String _selectedType = 'All';
  double _minRating = 0.0;
  bool _verifiedOnly = true;

  @override
  void initState() {
    super.initState();
    _loadHospitals();
  }

  void _loadHospitals() {
    final provider = Provider.of<HospitalProvider>(context, listen: false);
    provider.searchHospitals(
      query: _searchController.text,
      city: _selectedCity == 'All' ? null : _selectedCity,
      type: _selectedType == 'All' ? null : _selectedType,
      minRating: _minRating,
      verifiedOnly: _verifiedOnly,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Find Hospitals',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.blue[600],
        elevation: 0,
      ),
      body: Column(
        children: [
          // Search Bar
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search hospitals, clinics, specialties...',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: IconButton(
                      icon: const Icon(Icons.clear),
                      onPressed: () {
                        _searchController.clear();
                        _loadHospitals();
                      },
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.grey[300]!),
                    ),
                    filled: true,
                    fillColor: Colors.grey[50],
                  ),
                  onSubmitted: (_) => _loadHospitals(),
                ),
                const SizedBox(height: 12),
                // Quick Filters
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip('All Cities', _selectedCity == 'All', () {
                        setState(() => _selectedCity = 'All');
                        _loadHospitals();
                      }),
                      _buildFilterChip('Johannesburg', _selectedCity == 'Johannesburg', () {
                        setState(() => _selectedCity = 'Johannesburg');
                        _loadHospitals();
                      }),
                      _buildFilterChip('Cape Town', _selectedCity == 'Cape Town', () {
                        setState(() => _selectedCity = 'Cape Town');
                        _loadHospitals();
                      }),
                      _buildFilterChip('Durban', _selectedCity == 'Durban', () {
                        setState(() => _selectedCity = 'Durban');
                        _loadHospitals();
                      }),
                      _buildFilterChip('Pretoria', _selectedCity == 'Pretoria', () {
                        setState(() => _selectedCity = 'Pretoria');
                        _loadHospitals();
                      }),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Filters Row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: Colors.grey[50],
            child: Row(
              children: [
                Expanded(
                  child: DropdownButton<String>(
                    value: _selectedType,
                    isExpanded: true,
                    items: ['All', 'Public Hospital', 'Private Hospital', 'Clinic', 'GP Practice']
                        .map((type) => DropdownMenuItem(value: type, child: Text(type)))
                        .toList(),
                    onChanged: (value) {
                      setState(() => _selectedType = value!);
                      _loadHospitals();
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: DropdownButton<double>(
                    value: _minRating,
                    isExpanded: true,
                    items: [0.0, 4.0, 4.5, 5.0]
                        .map((rating) => DropdownMenuItem(
                              value: rating,
                              child: Text(rating == 0.0 ? 'Any Rating' : '${rating}+ Stars'),
                            ))
                        .toList(),
                    onChanged: (value) {
                      setState(() => _minRating = value!);
                      _loadHospitals();
                    },
                  ),
                ),
              ],
            ),
          ),
          // Hospital List
          Expanded(
            child: Consumer<HospitalProvider>(
              builder: (context, provider, child) {
                if (provider.loading) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (provider.hospitals.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.hospital_outlined, size: 64, color: Colors.grey[400]),
                        const SizedBox(height: 16),
                        Text('No hospitals found', style: TextStyle(color: Colors.grey[600])),
                      ],
                    ),
                  );
                }
                return ListView.builder(
                  itemCount: provider.hospitals.length,
                  itemBuilder: (context, index) {
                    final hospital = provider.hospitals[index];
                    return _buildHospitalCard(hospital);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, bool selected, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => onTap(),
        selectedColor: Colors.blue[100],
        checkmarkColor: Colors.blue[700],
      ),
    );
  }

  Widget _buildHospitalCard(Hospital hospital) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () {
          Navigator.pushNamed(context, '/hospital/${hospital.id}');
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      hospital.name,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  if (hospital.verified)
                    Icon(Icons.verified, color: Colors.blue[600], size: 20),
                  if (hospital.isFeatured)
                    Container(
                      margin: const EdgeInsets.only(left: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.yellow[400],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        '⭐ PROMOTED',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.location_on, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 4),
                  Text(hospital.city, style: TextStyle(color: Colors.grey[600])),
                  const SizedBox(width: 16),
                  Icon(Icons.star, size: 16, color: Colors.amber[600]),
                  const SizedBox(width: 4),
                  Text(
                    '${hospital.rating} (${hospital.totalReviews})',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ],
              ),
              if (hospital.departments.isNotEmpty) ...[
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: hospital.departments.take(3).map((dept) {
                    return Chip(
                      label: Text(dept, style: const TextStyle(fontSize: 11)),
                      backgroundColor: Colors.blue[50],
                      padding: const EdgeInsets.all(4),
                    );
                  }).toList(),
                ),
              ],
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton.icon(
                    onPressed: () {
                      // Call hospital
                    },
                    icon: const Icon(Icons.phone),
                    label: const Text('Call'),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.pushNamed(context, '/hospital/${hospital.id}');
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue[600],
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Text('View Profile'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}

