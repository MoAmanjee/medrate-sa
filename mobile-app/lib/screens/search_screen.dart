import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'doctor_profile_screen.dart';
import '../models/doctor.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  String _searchQuery = '';
  bool _mapView = false;
  List<Doctor> _doctors = [];

  @override
  void initState() {
    super.initState();
    _loadDoctors();
  }

  Future<void> _loadDoctors() async {
    // Fetch doctors from API
    // Mock data for now
    setState(() {
      _doctors = [
        Doctor(
          id: '1',
          displayName: 'Dr. Jane Smith',
          specialization: 'Cardiologist',
          verified: true,
          ratingAvg: 4.8,
          numReviews: 45,
          location: const LatLng(-26.2041, 28.0473),
        ),
        Doctor(
          id: '2',
          displayName: 'Dr. John Doe',
          specialization: 'GP',
          verified: true,
          ratingAvg: 4.5,
          numReviews: 32,
          location: const LatLng(-26.2051, 28.0483),
        ),
      ];
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Find Doctors'),
        actions: [
          IconButton(
            icon: Icon(_mapView ? Icons.list : Icons.map),
            onPressed: () => setState(() => _mapView = !_mapView),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search by specialty, name, or location',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onChanged: (value) => setState(() => _searchQuery = value),
            ),
          ),

          // View Toggle
          Expanded(
            child: _mapView ? _buildMapView() : _buildListView(),
          ),
        ],
      ),
    );
  }

  Widget _buildListView() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: _doctors.length,
      itemBuilder: (context, index) {
        final doctor = _doctors[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.blue.shade100,
              child: const Icon(Icons.person),
            ),
            title: Row(
              children: [
                Expanded(
                  child: Text(
                    doctor.displayName,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
                if (doctor.verified)
                  const Icon(Icons.verified, color: Colors.green, size: 18),
              ],
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(doctor.specialization),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.star, color: Colors.amber, size: 16),
                    const SizedBox(width: 4),
                    Text('${doctor.ratingAvg} (${doctor.numReviews})'),
                  ],
                ),
              ],
            ),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => DoctorProfileScreen(doctorId: doctor.id),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildMapView() {
    return GoogleMap(
      initialCameraPosition: const CameraPosition(
        target: LatLng(-26.2041, 28.0473),
        zoom: 12,
      ),
      markers: _doctors.map((doctor) {
        if (doctor.location == null) return null;
        return Marker(
          markerId: MarkerId(doctor.id),
          position: doctor.location!,
          infoWindow: InfoWindow(
            title: doctor.displayName,
            snippet: doctor.specialization,
          ),
        );
      }).whereType<Marker>().toSet(),
    );
  }
}

