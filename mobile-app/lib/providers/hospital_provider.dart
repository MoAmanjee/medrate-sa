import 'package:flutter/foundation.dart';
import '../models/hospital.dart';
import '../services/api_service.dart';

class HospitalProvider with ChangeNotifier {
  final ApiService _apiService;
  
  List<Hospital> _hospitals = [];
  bool _loading = false;
  String? _error;

  HospitalProvider(this._apiService);

  List<Hospital> get hospitals => _hospitals;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> searchHospitals({
    String? query,
    String? city,
    String? type,
    double? minRating,
    bool verifiedOnly = true,
  }) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.searchHospitals(
        query: query,
        city: city,
        type: type,
        minRating: minRating,
        verifiedOnly: verifiedOnly,
      );

      if (response['success'] == true) {
        final hospitalsData = response['data']['hospitals'] as List;
        _hospitals = hospitalsData
            .map((json) => Hospital.fromJson(json))
            .toList();
        _error = null;
      } else {
        _error = response['error'] ?? 'Failed to load hospitals';
        _hospitals = [];
      }
    } catch (e) {
      _error = e.toString();
      _hospitals = [];
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<Hospital?> getHospitalById(String id) async {
    try {
      final response = await _apiService.getHospital(id);
      if (response['success'] == true) {
        return Hospital.fromJson(response['data']);
      }
      return null;
    } catch (e) {
      _error = e.toString();
      return null;
    }
  }
}

