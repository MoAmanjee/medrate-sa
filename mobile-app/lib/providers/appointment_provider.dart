import 'package:flutter/foundation.dart';

class Appointment {
  final String id;
  final String doctorId;
  final String doctorName;
  final DateTime startTime;
  final String status;
  final String? checkinCode;

  Appointment({
    required this.id,
    required this.doctorId,
    required this.doctorName,
    required this.startTime,
    required this.status,
    this.checkinCode,
  });
}

class AppointmentProvider extends ChangeNotifier {
  List<Appointment> _appointments = [];

  List<Appointment> get appointments => _appointments;

  Future<void> loadAppointments() async {
    // Fetch from API
    _appointments = [];
    notifyListeners();
  }

  Future<void> createAppointment({
    required String doctorId,
    required DateTime startTime,
  }) async {
    // Create appointment via API
    notifyListeners();
  }
}

