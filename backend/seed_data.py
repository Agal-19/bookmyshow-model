import os
import django
import random
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bookmyshow_backend.settings')
django.setup()

from django.contrib.auth.models import User
from django.utils import timezone
from users.models import UserProfile
from movies.models import Genre, Language, City, Theater, Screen, Movie, Showtime, Review
from ticket_bookings.models import Seat

def seed_database():
    print("[+] Starting comprehensive database seeding...")

    # 1. Superuser / Admin
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={'email': 'admin@bookmyshow.com', 'is_staff': True, 'is_superuser': True}
    )
    if created:
        admin_user.set_password('Admin123!')
        admin_user.save()
    UserProfile.objects.get_or_create(user=admin_user, defaults={'preferred_city': 'Madurai'})
    print("  - Admin: admin / Admin123!")

    demo_user, created = User.objects.get_or_create(
        username='john_doe',
        defaults={'email': 'john@example.com', 'first_name': 'John', 'last_name': 'Doe'}
    )
    if created:
        demo_user.set_password('User123!')
        demo_user.save()
    UserProfile.objects.get_or_create(user=demo_user, defaults={'preferred_city': 'Madurai'})
    print("  - Demo user: john_doe / User123!")

    # 2. Cities
    cities_data = [
        ('Madurai', 'Tamil Nadu'),
        ('Tiruchirappalli', 'Tamil Nadu'),
        ('Thanjavur', 'Tamil Nadu'),
        ('Chennai', 'Tamil Nadu'),
        ('Bengaluru', 'Karnataka'),
        ('Coimbatore', 'Tamil Nadu'),
        ('Virudhunagar', 'Tamil Nadu'),
    ]
    city_objs = {}
    for cname, cstate in cities_data:
        c, _ = City.objects.get_or_create(name=cname, defaults={'state': cstate})
        city_objs[cname] = c
    print(f"  - {len(city_objs)} Cities seeded.")

    # 3. Genres
    genre_objs = {}
    for gname in ['Action', 'Comedy', 'Drama', 'Thriller', 'Romance', 'Horror', 'Animation', 'Sci-Fi', 'Family']:
        g, _ = Genre.objects.get_or_create(name=gname, defaults={'slug': gname.lower().replace(' ', '-').replace('/', '-')})
        genre_objs[gname] = g

    # 4. Languages
    lang_objs = {}
    for lname, lcode in [('Tamil','ta'),('English','en'),('Hindi','hi'),('Telugu','te'),('Malayalam','ml'),('Kannada','kn')]:
        l, _ = Language.objects.get_or_create(name=lname, defaults={'code': lcode})
        lang_objs[lname] = l

    # 5. Detailed Theatre Data (exact from user specification)
    theatres_detailed = {
        'Madurai': [
            {
                'name': 'Vetri Cinemas',
                'address': 'Near Meenakshi Amman Temple, East Masi Street, Madurai - 625001',
                'screens': 3,
                'contact': '+91 9042100001',
                'facilities': ['Dolby Atmos', 'Parking', 'Food & Beverages', '4K Projection'],
            },
            {
                'name': 'Gopuram Cinemas',
                'address': '14, North Veli Street, Madurai - 625001',
                'screens': 2,
                'contact': '+91 9042100002',
                'facilities': ['Dolby Digital', 'Parking', 'Food & Beverages'],
            },
            {
                'name': 'Radiance Cinema',
                'address': 'Bypass Road, Madurai - 625010',
                'screens': 2,
                'contact': '+91 9042100003',
                'facilities': ['Laser Projection', 'Parking', 'Snack Bar'],
            },
            {
                'name': 'INOX Vishaal De Mall',
                'address': 'Vishaal De Mall, Bypass Road, Madurai - 625016',
                'screens': 4,
                'contact': '+91 9042100004',
                'facilities': ['IMAX 3D', 'Dolby Atmos', 'Food Court', 'Valet Parking', 'Recliner Seats'],
            },
            {
                'name': 'JAZZ & ARSH Cinemas',
                'address': 'Kalavasal, Madurai - 625016',
                'screens': 2,
                'contact': '+91 9042100005',
                'facilities': ['Dolby Digital', 'Parking', 'Food & Beverages'],
            },
            {
                'name': 'Priya Complex',
                'address': 'Anna Nagar, Madurai - 625020',
                'screens': 2,
                'contact': '+91 9042100006',
                'facilities': ['Parking', 'Snack Bar', 'Wheelchair Access'],
            },
            {
                'name': 'Guru Theatre',
                'address': 'Sivaganga Road, Madurai - 625020',
                'screens': 2,
                'contact': '+91 9042100007',
                'facilities': ['Parking', 'Food & Beverages'],
            },
            {
                'name': 'Thanga Regal',
                'address': 'West Perumal Maistry Street, Madurai - 625001',
                'screens': 2,
                'contact': '+91 9042100008',
                'facilities': ['Parking', 'Snack Bar'],
            },
            {
                'name': 'Tamil Jaya Cinemas',
                'address': 'KK Nagar, Madurai - 625020',
                'screens': 2,
                'contact': '+91 9042100009',
                'facilities': ['Dolby Digital', 'Parking', 'Food & Beverages'],
            },
            {
                'name': 'Solamalai Cinemas',
                'address': 'Thirunagar, Madurai - 625006',
                'screens': 2,
                'contact': '+91 9042100010',
                'facilities': ['Laser Projection', 'Parking', 'Snack Bar'],
            },
        ],
        'Tiruchirappalli': [
            {
                'name': 'LA CINEMA: MARIS',
                'address': 'Junction Main Road, Trichy - 620001',
                'screens': 3,
                'contact': '+91 9043200001',
                'facilities': ['Dolby Atmos', '4K Projection', 'Parking', 'Food & Beverages'],
            },
            {
                'name': 'LA CINEMA: Sona Mina',
                'address': 'Sona Mina Complex, Singarathope, Trichy - 620002',
                'screens': 3,
                'contact': '+91 9043200002',
                'facilities': ['Dolby Atmos', 'Recliner Seats', 'Parking', 'Food & Beverages'],
            },
            {
                'name': 'Mega Star Cinemas',
                'address': 'Ariyamangalam, Trichy - 620010',
                'screens': 3,
                'contact': '+91 9043200003',
                'facilities': ['Dolby Digital', 'Parking', 'Cafeteria'],
            },
            {
                'name': 'Krishna Theatre',
                'address': 'Big Bazaar Street, Trichy - 620001',
                'screens': 2,
                'contact': '+91 9043200004',
                'facilities': ['Parking', 'Snack Bar'],
            },
            {
                'name': 'Murugan Theatre',
                'address': 'Palakarai, Trichy - 620001',
                'screens': 2,
                'contact': '+91 9043200005',
                'facilities': ['Parking', 'Food & Beverages'],
            },
            {
                'name': 'Rangaraja Theatre',
                'address': 'Cantonment, Trichy - 620001',
                'screens': 2,
                'contact': '+91 9043200006',
                'facilities': ['Parking', 'Snack Bar'],
            },
            {
                'name': 'Saraswathi Theatre',
                'address': 'Thillai Nagar, Trichy - 620018',
                'screens': 2,
                'contact': '+91 9043200007',
                'facilities': ['Dolby Digital', 'Parking', 'Snack Bar'],
            },
        ],
        'Thanjavur': [
            {
                'name': 'GV Cinemas',
                'address': 'Medical College Road, Thanjavur - 613004',
                'screens': 3,
                'contact': '+91 9044300001',
                'facilities': ['Dolby Atmos', 'Parking', 'Food & Beverages'],
            },
            {
                'name': 'New Cinema',
                'address': 'South Main Street, Thanjavur - 613001',
                'screens': 2,
                'contact': '+91 9044300002',
                'facilities': ['Parking', 'Snack Bar'],
            },
            {
                'name': 'Krishna Theatre',
                'address': 'Railway Station Road, Thanjavur - 613001',
                'screens': 2,
                'contact': '+91 9044300003',
                'facilities': ['Parking', 'Food & Beverages'],
            },
            {
                'name': 'Vijaya Theatre',
                'address': 'Nanjikottai Road, Thanjavur - 613006',
                'screens': 2,
                'contact': '+91 9044300004',
                'facilities': ['Dolby Digital', 'Parking', 'Snack Bar'],
            },
            {
                'name': 'PL.A. Cinemas',
                'address': 'Poondi Road, Thanjavur - 613005',
                'screens': 2,
                'contact': '+91 9044300005',
                'facilities': ['Parking', 'Snack Bar'],
            },
            {
                'name': 'Ram Muthuram Cinemas',
                'address': 'Kumbakonam Road, Thanjavur - 613001',
                'screens': 3,
                'contact': '+91 9044300006',
                'facilities': ['Dolby Atmos', 'Parking', 'Food & Beverages', '4K Projection'],
            },
        ],
        'Chennai': [
            {
                'name': 'PVR INOX',
                'address': 'Phoenix Marketcity Mall, Velachery, Chennai - 600042',
                'screens': 8,
                'contact': '+91 9044400001',
                'facilities': ['IMAX 3D', 'Dolby Atmos', 'Recliner Seats', 'Valet Parking', 'Gourmet Food', '4DX'],
            },
            {
                'name': 'AGS Cinemas',
                'address': 'Villivakkam, Chennai - 600049',
                'screens': 5,
                'contact': '+91 9044400002',
                'facilities': ['Dolby Atmos', '4K Projection', 'Parking', 'Food & Beverages'],
            },
            {
                'name': 'Rohini Silver Screens',
                'address': 'Koyambedu, Chennai - 600107',
                'screens': 4,
                'contact': '+91 9044400003',
                'facilities': ['Dolby Digital', 'Parking', 'Food & Beverages', 'Wheelchair Access'],
            },
            {
                'name': 'Kamala Cinemas',
                'address': 'Tharamani, Chennai - 600113',
                'screens': 3,
                'contact': '+91 9044400004',
                'facilities': ['Laser Projection', 'Parking', 'Cafeteria'],
            },
            {
                'name': 'Luxe Cinemas',
                'address': 'Vadapalani, Chennai - 600026',
                'screens': 4,
                'contact': '+91 9044400005',
                'facilities': ['Dolby Atmos', 'Recliner Seats', 'Valet Parking', 'Food & Beverages'],
            },
            {
                'name': 'Sathyam Cinemas',
                'address': 'Royapettah, Chennai - 600014',
                'screens': 10,
                'contact': '+91 9044400006',
                'facilities': ['IMAX 3D', 'Dolby Atmos', 'Parking', 'Food Court', '4DX', 'Recliner Seats'],
            },
            {
                'name': 'Escape Cinemas',
                'address': 'Express Avenue Mall, Royapettah, Chennai - 600002',
                'screens': 5,
                'contact': '+91 9044400007',
                'facilities': ['Dolby Digital', 'Parking', 'Food Court', 'Wheelchair Access'],
            },
            {
                'name': 'Vels Theatres',
                'address': 'Pallavaram, Chennai - 600043',
                'screens': 3,
                'contact': '+91 9044400008',
                'facilities': ['Dolby Digital', 'Parking', 'Snack Bar'],
            },
        ],
        'Bengaluru': [
            {
                'name': 'PVR INOX Bengaluru',
                'address': 'Forum Mall, Koramangala, Bengaluru - 560095',
                'screens': 8,
                'contact': '+91 9045500001',
                'facilities': ['IMAX 3D', 'Dolby Atmos', 'Recliner Seats', 'Valet Parking', 'Food Court'],
            },
            {
                'name': 'Cinepolis',
                'address': 'Nexus Mall, Whitefield, Bengaluru - 560066',
                'screens': 6,
                'contact': '+91 9045500002',
                'facilities': ['Dolby Atmos', '4DX', 'Parking', 'Food & Beverages', 'Recliner Seats'],
            },
            {
                'name': 'Rockline Cinemas',
                'address': 'Rajajinagar, Bengaluru - 560010',
                'screens': 4,
                'contact': '+91 9045500003',
                'facilities': ['Dolby Digital', 'Parking', 'Cafeteria'],
            },
            {
                'name': 'Gopalan Cinemas',
                'address': 'Gopalan Mall, Bannerghatta Road, Bengaluru - 560076',
                'screens': 5,
                'contact': '+91 9045500004',
                'facilities': ['Dolby Atmos', 'Parking', 'Food & Beverages'],
            },
            {
                'name': 'Orion Mall PVR',
                'address': 'Orion Mall, Rajajinagar, Bengaluru - 560010',
                'screens': 7,
                'contact': '+91 9045500005',
                'facilities': ['IMAX 3D', 'Dolby Atmos', 'Recliner Seats', 'Food Court', 'Valet Parking'],
            },
            {
                'name': 'Phoenix Marketcity PVR',
                'address': 'Phoenix Marketcity, Whitefield, Bengaluru - 560048',
                'screens': 8,
                'contact': '+91 9045500006',
                'facilities': ['IMAX 3D', 'Dolby Atmos', 'Food Court', 'Recliner Seats', '4DX'],
            },
            {
                'name': 'Vega City PVR',
                'address': 'Vega City Mall, Bannerghatta Road, Bengaluru - 560076',
                'screens': 5,
                'contact': '+91 9045500007',
                'facilities': ['Dolby Atmos', 'Parking', 'Food & Beverages'],
            },
            {
                'name': 'INOX Garuda Mall',
                'address': 'Garuda Mall, Magrath Road, Bengaluru - 560025',
                'screens': 6,
                'contact': '+91 9045500008',
                'facilities': ['Dolby Atmos', 'Recliner Seats', 'Parking', 'Food & Beverages', '4K Projection'],
            },
        ],
        'Coimbatore': [
            {
                'name': 'PVR INOX Prozone Mall',
                'address': 'Prozone Mall, Avinashi Road, Coimbatore - 641014',
                'screens': 6,
                'contact': '+91 9046600001',
                'facilities': ['Dolby Atmos', 'IMAX 3D', 'Recliner Seats', 'Parking', 'Food Court'],
            },
            {
                'name': 'KG Cinemas',
                'address': 'KG Centre, Avinashi Road, Coimbatore - 641018',
                'screens': 4,
                'contact': '+91 9046600002',
                'facilities': ['Dolby Atmos', '4K Projection', 'Parking', 'Food & Beverages'],
            },
            {
                'name': 'Brookefields PVR',
                'address': 'Brookefields Mall, Krishnaswamy Road, Coimbatore - 641001',
                'screens': 5,
                'contact': '+91 9046600003',
                'facilities': ['Dolby Digital', 'Parking', 'Food & Beverages', 'Wheelchair Access'],
            },
            {
                'name': 'INOX Fun Republic Mall',
                'address': 'Fun Republic Mall, Peelamedu, Coimbatore - 641004',
                'screens': 4,
                'contact': '+91 9046600004',
                'facilities': ['Dolby Atmos', 'Parking', 'Food & Beverages', 'Recliner Seats'],
            },
            {
                'name': 'Sri Baba Cinemas',
                'address': 'Gandhipuram, Coimbatore - 641012',
                'screens': 2,
                'contact': '+91 9046600005',
                'facilities': ['Dolby Digital', 'Parking', 'Snack Bar'],
            },
            {
                'name': 'Shanti Theatre',
                'address': 'RS Puram, Coimbatore - 641002',
                'screens': 2,
                'contact': '+91 9046600006',
                'facilities': ['Parking', 'Food & Beverages'],
            },
            {
                'name': 'Broadway Cinemas',
                'address': 'Saibaba Colony, Coimbatore - 641011',
                'screens': 2,
                'contact': '+91 9046600007',
                'facilities': ['Dolby Digital', 'Parking', 'Snack Bar'],
            },
        ],
        'Virudhunagar': [
            {
                'name': 'Ayyanar Theatre',
                'address': 'Srivilliputhur Road, Virudhunagar - 626001',
                'screens': 2,
                'contact': '+91 9047700001',
                'facilities': ['Parking', 'Food & Beverages'],
            },
            {
                'name': 'Sri Devi Theatre',
                'address': 'Rajapalayam Road, Virudhunagar - 626001',
                'screens': 2,
                'contact': '+91 9047700002',
                'facilities': ['Parking', 'Snack Bar'],
            },
            {
                'name': 'Siva Theatre',
                'address': 'Madurai Road, Virudhunagar - 626002',
                'screens': 2,
                'contact': '+91 9047700003',
                'facilities': ['Dolby Digital', 'Parking', 'Snack Bar'],
            },
            {
                'name': 'Sree Ram Theatre',
                'address': 'Kovilpatti Road, Virudhunagar - 626003',
                'screens': 2,
                'contact': '+91 9047700004',
                'facilities': ['Parking', 'Food & Beverages'],
            },
        ],
    }

    screens_list = []
    theatres_list = []

    print("  - Seeding theatres with detailed data...")
    for city_name, t_list in theatres_detailed.items():
        city_obj = city_objs[city_name]
        for t_data in t_list:
            theater, _ = Theater.objects.get_or_create(
                name=t_data['name'],
                city=city_obj,
                defaults={
                    'address': t_data['address'],
                    'total_screens': t_data['screens'],
                    'contact_number': t_data['contact'],
                    'facilities': t_data['facilities'],
                    'active_status': True
                }
            )
            # Update existing records with correct data
            if not _:
                theater.address = t_data['address']
                theater.total_screens = t_data['screens']
                theater.contact_number = t_data['contact']
                theater.facilities = t_data['facilities']
                theater.active_status = True
                theater.save()

            theatres_list.append(theater)

            # Screens per theatre based on screen count
            num_screens = t_data['screens']
            has_dolby = 'Dolby Atmos' in t_data['facilities']
            has_imax = 'IMAX 3D' in t_data['facilities']
            for s_num in range(1, num_screens + 1):
                if s_num == 1 and has_imax:
                    stype = 'IMAX'
                elif s_num == 2 and has_dolby:
                    stype = 'Dolby Atmos'
                elif s_num == num_screens and num_screens > 2:
                    stype = '3D'
                else:
                    stype = '2D'
                screen, _ = Screen.objects.get_or_create(
                    name=f"Screen {s_num}",
                    theater=theater,
                    defaults={'screen_type': stype, 'total_seats': 60}
                )
                screens_list.append(screen)

    print(f"  - {len(theatres_list)} Theatres & {len(screens_list)} Screens seeded.")

    # 6. Seats
    rows = ['A', 'B', 'C', 'D', 'E', 'F']
    created_seats = 0
    for screen in screens_list:
        if not Seat.objects.filter(screen=screen).exists():
            seats_batch = []
            for row in rows:
                seat_type = 'SILVER' if row in ['A', 'B'] else ('GOLD' if row in ['C', 'D'] else 'VIP')
                for num in range(1, 11):
                    seats_batch.append(Seat(screen=screen, row_name=row, seat_number=num, seat_type=seat_type))
            Seat.objects.bulk_create(seats_batch)
            created_seats += len(seats_batch)
    print(f"  - Seats seeded (Silver A-B, Gold C-D, VIP E-F tiers).")

    # 7. Movies
    movies_data = [
        {
            'title': 'Mandaadi', 'slug': 'mandaadi',
            'description': 'An intense action drama set against the backdrop of traditional rural sports. A young hero battles against corrupt powers threatening his village legacy.',
            'director': 'Director Vetri',
            'poster_url': 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600',
            'backdrop_url': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1400',
            'youtube_trailer_id': 'Way9Dexny3w',
            'duration_minutes': 150, 'age_rating': 'UA',
            'release_date': datetime(2026, 9, 1).date(), 'popularity_score': 9.7,
            'genres': ['Action', 'Drama'], 'languages': ['Tamil', 'Telugu'],
            'cast': [{'name': 'Silambarasan TR', 'role': 'Hero'}, {'name': 'Priya Bhavani Shankar', 'role': 'Heroine'}]
        },
        {
            'title': 'Sardar 2', 'slug': 'sardar-2',
            'description': 'The sequel to the blockbuster spy thriller. High stakes espionage, double agents, and international intrigue unfold as Agent Vijay faces his toughest mission yet.',
            'director': 'P.S. Mithran',
            'poster_url': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600',
            'backdrop_url': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1400',
            'youtube_trailer_id': 'COv52Qyctws',
            'duration_minutes': 165, 'age_rating': 'UA',
            'release_date': datetime(2026, 9, 10).date(), 'popularity_score': 9.6,
            'genres': ['Action', 'Thriller'], 'languages': ['Tamil', 'Hindi', 'Telugu'],
            'cast': [{'name': 'Karthi', 'role': 'Agent Vijay'}, {'name': 'Raashii Khanna', 'role': 'Shalini'}]
        },
        {
            'title': 'Immortal', 'slug': 'immortal',
            'description': 'A Sci-Fi masterpiece about a scientist who discovers the key to immortality buried in ancient temples across India.',
            'director': 'Shankar',
            'poster_url': 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600',
            'backdrop_url': 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1400',
            'youtube_trailer_id': 'uYPbbksJxIg',
            'duration_minutes': 175, 'age_rating': 'UA',
            'release_date': datetime(2026, 8, 20).date(), 'popularity_score': 9.5,
            'genres': ['Sci-Fi', 'Thriller'], 'languages': ['Tamil', 'English', 'Hindi'],
            'cast': [{'name': 'Vijay', 'role': 'Dr. Arun'}, {'name': 'Deepika Padukone', 'role': 'Maya'}]
        },
        {
            'title': 'Vishwanath and Sons', 'slug': 'vishwanath-and-sons',
            'description': 'A heartwarming drama about a legendary business family navigating generational differences, love, and legacy.',
            'director': 'Atlee Kumar',
            'poster_url': 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600',
            'backdrop_url': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1400',
            'youtube_trailer_id': 'kQDd1AhGIHk',
            'duration_minutes': 140, 'age_rating': 'U',
            'release_date': datetime(2026, 8, 15).date(), 'popularity_score': 9.1,
            'genres': ['Family', 'Drama', 'Comedy'], 'languages': ['Hindi', 'Tamil'],
            'cast': [{'name': 'Amitabh Bachchan', 'role': 'Vishwanath'}, {'name': 'Ranveer Singh', 'role': 'Arjun'}]
        },
        {
            'title': 'Hi', 'slug': 'hi-movie',
            'description': 'A vibrant romantic comedy that explores modern love, friendship, and the chaos of unexpected encounters in a digital age.',
            'director': 'Trivikram Srinivas',
            'poster_url': 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600',
            'backdrop_url': 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1400',
            'youtube_trailer_id': 'LEjhY15eCx0',
            'duration_minutes': 130, 'age_rating': 'U',
            'release_date': datetime(2026, 9, 5).date(), 'popularity_score': 9.2,
            'genres': ['Romance', 'Comedy'], 'languages': ['Telugu', 'Tamil'],
            'cast': [{'name': 'Nani', 'role': 'Arjun'}, {'name': 'Sai Pallavi', 'role': 'Priya'}]
        },
        {
            'title': 'Haiwaan', 'slug': 'haiwaan',
            'description': 'A spine-chilling horror thriller that unravels dark legends lurking inside a remote forest. Not for the faint-hearted.',
            'director': 'Anurag Kashyap',
            'poster_url': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600',
            'backdrop_url': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1400',
            'youtube_trailer_id': 'uYPbbksJxIg',
            'duration_minutes': 138, 'age_rating': 'A',
            'release_date': datetime(2026, 9, 12).date(), 'popularity_score': 9.0,
            'genres': ['Horror', 'Thriller'], 'languages': ['Hindi', 'Tamil'],
            'cast': [{'name': 'Rajkummar Rao', 'role': 'Detective Kumar'}, {'name': 'Taapsee Pannu', 'role': 'Maya'}]
        },
        {
            'title': 'Kalki 2898 AD', 'slug': 'kalki-2898-ad',
            'description': "A futuristic mythological epic. Set in 2898 AD, humanity's last hope lies with an unlikely hero destined by ancient prophecy.",
            'director': 'Nag Ashwin',
            'poster_url': 'https://images.unsplash.com/photo-1535016120720-40c646be5580?q=80&w=600',
            'backdrop_url': 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1400',
            'youtube_trailer_id': 'kQDd1AhGIHk',
            'duration_minutes': 178, 'age_rating': 'UA',
            'release_date': datetime(2026, 5, 10).date(), 'popularity_score': 9.4,
            'genres': ['Sci-Fi', 'Action'], 'languages': ['Telugu', 'Tamil', 'Hindi'],
            'cast': [{'name': 'Prabhas', 'role': 'Bhairava'}, {'name': 'Deepika Padukone', 'role': 'SUM-80'}]
        },
        {
            'title': 'Jana Nayagan', 'slug': 'jana-nayagan',
            'description': 'A political action drama about a people\'s leader who rises from poverty to fight institutional corruption and bring justice.',
            'director': 'Nelson Dilipkumar',
            'poster_url': 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=600',
            'backdrop_url': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1400',
            'youtube_trailer_id': 'Way9Dexny3w',
            'duration_minutes': 160, 'age_rating': 'UA',
            'release_date': datetime(2026, 9, 18).date(), 'popularity_score': 9.3,
            'genres': ['Action', 'Drama'], 'languages': ['Tamil'],
            'cast': [{'name': 'Thalapathy Vijay', 'role': 'Jana'}, {'name': 'Keerthy Suresh', 'role': 'Anbu'}]
        },
    ]

    movie_objs = []
    for mdata in movies_data:
        m, created = Movie.objects.get_or_create(
            title=mdata['title'],
            defaults={
                'slug': mdata['slug'],
                'description': mdata['description'],
                'director': mdata['director'],
                'poster_url': mdata['poster_url'],
                'backdrop_url': mdata['backdrop_url'],
                'youtube_trailer_url': f"https://www.youtube.com/watch?v={mdata['youtube_trailer_id']}",
                'youtube_trailer_id': mdata['youtube_trailer_id'],
                'duration_minutes': mdata['duration_minutes'],
                'age_rating': mdata['age_rating'],
                'release_date': mdata['release_date'],
                'popularity_score': mdata['popularity_score'],
                'cast_members': mdata['cast'],
                'status': 'NOW_SHOWING'
            }
        )
        if created:
            for gn in mdata['genres']:
                if gn in genre_objs:
                    m.genres.add(genre_objs[gn])
            for ln in mdata['languages']:
                if ln in lang_objs:
                    m.languages.add(lang_objs[ln])
        movie_objs.append(m)
    print(f"  - {len(movie_objs)} Movies seeded.")

    # 8. Showtimes (Today + next 5 days, realistic show times)
    now = timezone.now()
    base_dates = [now.date() + timedelta(days=d) for d in range(0, 6)]
    showtime_slots = [
        (10, 0, '2D'),
        (13, 25, '3D'),
        (16, 45, 'Dolby Atmos'),
        (19, 25, '2D'),
        (22, 0, 'Dolby Atmos'),
    ]

    showtimes_count = 0
    for movie in movie_objs:
        # Each movie assigned to ~20 screens spread across cities
        assigned_screens = random.sample(screens_list, min(20, len(screens_list)))
        for screen in assigned_screens:
            lang_name = 'Tamil' if 'Tamil' in [l.name for l in movie.languages.all()] else 'English'
            for b_date in base_dates:
                # 2-3 slots per day per screen
                for (hr, mn, fmt) in random.sample(showtime_slots, 3):
                    st_time = timezone.make_aware(
                        datetime(b_date.year, b_date.month, b_date.day, hr, mn)
                    )
                    _, created = Showtime.objects.get_or_create(
                        movie=movie, screen=screen, start_time=st_time,
                        defaults={
                            'format': fmt,
                            'language': lang_name,
                            'price_silver': random.choice([120, 150, 180]),
                            'price_gold': random.choice([180, 200, 220]),
                            'price_vip': random.choice([280, 300, 350]),
                        }
                    )
                    if created:
                        showtimes_count += 1

    print(f"  - {showtimes_count} Showtimes created across 6 dates.")

    # 9. Sample Reviews
    Review.objects.get_or_create(
        movie=movie_objs[0], user=demo_user,
        defaults={'rating': 5, 'comment': 'Outstanding action sequences! A must-watch.', 'is_verified_viewer': True}
    )
    Review.objects.get_or_create(
        movie=movie_objs[1], user=demo_user,
        defaults={'rating': 4, 'comment': 'Karthi delivered brilliantly. Gripping thriller!', 'is_verified_viewer': True}
    )

    print("[+] Database seeding completed successfully!")
    print(f"    Cities: {City.objects.count()} | Theatres: {Theater.objects.count()} | Movies: {Movie.objects.count()} | Showtimes: {Showtime.objects.count()}")


if __name__ == '__main__':
    seed_database()
