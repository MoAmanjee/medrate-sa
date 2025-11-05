class Hospital {
  final String id;
  final String name;
  final String type;
  final String city;
  final String province;
  final String? address;
  final String? phone;
  final String? email;
  final String? website;
  final bool verified;
  final bool claimed;
  final bool isFeatured;
  final String promotionTier;
  final double rating;
  final int totalReviews;
  final List<String> departments;
  final List<String> specialties;
  final bool emergencyServices;
  final double? latitude;
  final double? longitude;

  Hospital({
    required this.id,
    required this.name,
    required this.type,
    required this.city,
    required this.province,
    this.address,
    this.phone,
    this.email,
    this.website,
    required this.verified,
    required this.claimed,
    required this.isFeatured,
    required this.promotionTier,
    required this.rating,
    required this.totalReviews,
    required this.departments,
    required this.specialties,
    required this.emergencyServices,
    this.latitude,
    this.longitude,
  });

  factory Hospital.fromJson(Map<String, dynamic> json) {
    return Hospital(
      id: json['id'] as String,
      name: json['name'] as String,
      type: json['type'] as String,
      city: json['city'] as String,
      province: json['province'] as String,
      address: json['address'] as String?,
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      website: json['website'] as String?,
      verified: json['verified'] as bool? ?? false,
      claimed: json['claimed'] as bool? ?? false,
      isFeatured: json['isFeatured'] as bool? ?? false,
      promotionTier: json['promotionTier'] as String? ?? 'basic',
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      totalReviews: json['totalReviews'] as int? ?? 0,
      departments: (json['departments'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      specialties: (json['specialties'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      emergencyServices: json['emergencyServices'] as bool? ?? false,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'type': type,
      'city': city,
      'province': province,
      'address': address,
      'phone': phone,
      'email': email,
      'website': website,
      'verified': verified,
      'claimed': claimed,
      'isFeatured': isFeatured,
      'promotionTier': promotionTier,
      'rating': rating,
      'totalReviews': totalReviews,
      'departments': departments,
      'specialties': specialties,
      'emergencyServices': emergencyServices,
      'latitude': latitude,
      'longitude': longitude,
    };
  }
}

