import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'screens/home_screen.dart';
import 'screens/search_screen.dart';
import 'screens/doctor_profile_screen.dart';
import 'screens/booking_screen.dart';
import 'screens/my_bookings_screen.dart';
import 'screens/review_screen.dart';
import 'screens/doctor_dashboard_screen.dart';
import 'providers/auth_provider.dart';
import 'providers/appointment_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => AppointmentProvider()),
      ],
      child: MaterialApp(
        title: 'RateTheDoctor',
        theme: ThemeData(
          primarySwatch: Colors.blue,
          useMaterial3: true,
          appBarTheme: const AppBarTheme(
            elevation: 0,
            backgroundColor: Colors.white,
            foregroundColor: Colors.black,
          ),
        ),
        home: const HomeScreen(),
        routes: {
          '/search': (context) => const SearchScreen(),
          '/doctor': (context) => const DoctorProfileScreen(),
          '/booking': (context) => const BookingScreen(),
          '/bookings': (context) => const MyBookingsScreen(),
          '/review': (context) => const ReviewScreen(),
          '/doctor-dashboard': (context) => const DoctorDashboardScreen(),
        },
      ),
    );
  }
}

