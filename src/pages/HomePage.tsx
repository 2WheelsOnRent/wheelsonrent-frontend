import VehicleCarousel from '../components/VehicleCarousel';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DateTimePicker from '../components/DateTimePicker';
import FAQSection from '../components/FAQSection';
import RatingsSection from '../components/RatingsSection';

const HomePage: React.FC = () => {
  // const [searchData] = useState({
  //   districtId: '',
  //   startDate: '',
  //   endDate: '',
  //   startTime: '',
  //   endTime: ''
  // });

  //const navigate = useNavigate();

  // const { data: vehiclesData } = useGetVehiclesQuery({ page: 1, size: 6 });
  // const { data: reviewsData } = useGetActiveWebsiteReviewsQuery();

  // const handleSearch = (e: React.FormEvent) => {
  //   e.preventDefault();
    
  //   if (!searchData.districtId || !searchData.startDate || !searchData.endDate || !searchData.startTime || !searchData.endTime) {
  //     alert('Please fill all search fields');
  //     return;
  //   }

  //   const params = new URLSearchParams({
  //     districtId: searchData.districtId,
  //     startDate: searchData.startDate,
  //     endDate: searchData.endDate,
  //     startTime: searchData.startTime,
  //     endTime: searchData.endTime
  //   });
  //   navigate(`/vehicles?${params.toString()}`);
  // };

  // const handleVehicleClick = (vehicleId: number) => {
  //   navigate(`/vehicles/${vehicleId}`);
  // };

  // const featuredVehicles = vehiclesData?.slice(0, 3).map(v => enhanceVehicleData(v)) || [];

  // const features = [
  //   { icon: Shield, title: 'Fully Insured', description: 'All vehicles come with comprehensive insurance coverage' },
  //   { icon: Headphones, title: '24/7 Support', description: 'Our team is always available to assist you' },
  //   { icon: Clock, title: 'Flexible Hours', description: 'Rent by the hour with no hidden charges' }
  // ];

  // const customerReviews = reviewsData && reviewsData.length > 0 ? reviewsData : [
  //   { id: 1, customerName: 'Rahul Shah', rating: 5, reviewText: 'Excellent service! The bike was in perfect condition.', isActive: true, displayOrder: 1 },
  //   { id: 2, customerName: 'Priya Patel', rating: 5, reviewText: 'Very convenient and affordable.', isActive: true, displayOrder: 2 },
  //   { id: 3, customerName: 'Amit Kumar', rating: 4, reviewText: 'Good experience overall.', isActive: true, displayOrder: 3 },
  //   { id: 4, customerName: 'Sneha Desai', rating: 5, reviewText: 'Best service in Gujarat!', isActive: true, displayOrder: 4 }
  // ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-indigo-50 to-purple-50">
        
        {/* Hero Section */}
        <section
          className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden
                     bg-[linear-gradient(135deg,#ffb87a,#ff7ac8,#7feaff,#80ffbf)]"
        >
          {/* Vertical lines pattern overlay */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                rgba(255, 255, 255, .6) 0px,
                rgba(255, 255, 255, .6) 1px,
                transparent 2px,
                transparent 100px
              )`  
            }}
          />
          
          {/* Content */}
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Your Journey Starts
                <span className="block text-white drop-shadow-lg">
                  With The Perfect Ride
                </span>
              </h1>
              <p className="text-xl text-gray-900/90 max-w-2xl mx-auto">
                Rent two-wheelers by the hour. Flexible, affordable, and always available when you need them.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <DateTimePicker />
            </div>
          </div>
        </section>

        {/* Vehicle Carousel - ADD ID HERE */}
        <section id="featured-vehicles" className="container mx-auto px-4 py-16">
          <VehicleCarousel />
        </section>

        {/* Ratings Section */}
        <section className="bg-gray-50">
          <RatingsSection />
        </section>

        {/* FAQ Section */}
        <FAQSection />

        <Footer />
      </div>
    </>
  );
};

export default HomePage;