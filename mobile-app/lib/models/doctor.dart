import 'package:google_maps_flutter/google_maps_flutter.dart';

class Doctor {
  final String id;
  final String displayName;
  final String specialization;
  final bool verified;
  final double ratingAvg;
  final int numReviews;
  final LatLng? location;
  final String? phone;
  final String? practiceName;

  Doctor({
    required this.id,
    required this.displayName,
    required this.specialization,
    required this.verified,
    required this.ratingAvg,
    required this.numReviews,
    this.location,
    this.phone,
    this.practiceName,
  });

  factory Doctor.fromJson(Map<String, dynamic> json) {
    return Doctor(
      id: json['id'],
      displayName: json['displayName'],
      specialization: json['specialization'],
      verified: json['verified'] ?? false,
      ratingAvg: (json['ratingAvg'] ?? 0).toDouble(),
      numReviews: json['numReviews'] ?? 0,
      location: json['location'] != null
          ? LatLng(json['location']['lat'], json['location']['lng'])
          : null,
      phone: json['phone'],
      practiceName: json['practiceName'],
    );
  }
}

