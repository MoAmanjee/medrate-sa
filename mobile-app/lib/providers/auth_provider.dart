import 'package:flutter/foundation.dart';

class User {
  final String id;
  final String email;
  final String role;
  final bool verified;

  User({
    required this.id,
    required this.email,
    required this.role,
    required this.verified,
  });
}

class AuthProvider extends ChangeNotifier {
  User? _user;
  bool _isAuthenticated = false;
  String? _token;

  User? get user => _user;
  bool get isAuthenticated => _isAuthenticated;
  String? get token => _token;

  Future<bool> login(String email, String password) async {
    // API call to login
    // For now, mock
    _user = User(
      id: '1',
      email: email,
      role: 'patient',
      verified: true,
    );
    _isAuthenticated = true;
    _token = 'mock-token';
    notifyListeners();
    return true;
  }

  Future<void> logout() async {
    _user = null;
    _isAuthenticated = false;
    _token = null;
    notifyListeners();
  }
}

