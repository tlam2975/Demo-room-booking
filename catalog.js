(function (root, factory) {
  const catalog = factory();
  if (typeof module === 'object' && module.exports) module.exports = catalog;
  if (root) root.STAY_CATALOG = catalog;
})(typeof window !== 'undefined' ? window : null, function () {
  return {
    site: {
      name: 'Hai Tien Stays',
      // Set the owner's tested personal Zalo contact URL before launch.
      zaloUrl: null
    },
    properties: [
      {
        id: 'flamingo-hai-tien',
        name: 'Flamingo Hải Tiến',
        heroImage: 'https://flamingoresorts.vn/wp-content/uploads/2025/04/142859_hotelimage_4404300981221403140861114103842026004167711454n.jpg',
        region: { vi: 'Thanh Hóa, Việt Nam', en: 'Thanh Hoa, Vietnam' },
        address: {
          vi: 'Khu du lịch biển Linh Trường, xã Hoằng Tiến, Thanh Hóa, Việt Nam',
          en: 'Linh Truong Beach Tourist Area, Hoang Tien Commune, Thanh Hoa, Vietnam'
        },
        // Resort pin from Google Maps; individual units inherit this location.
        latitude: 19.8881207,
        longitude: 105.9626543,
        timezone: 'Asia/Ho_Chi_Minh',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=19.8881207%2C105.9626543',
        description: {
          vi: 'Một kỳ nghỉ bên biển Hải Tiến, Thanh Hóa. Chọn phòng và trao đổi trực tiếp với chủ phòng để xác nhận ngày ở, giá và dịch vụ.',
          en: 'A stay by the coast of Hai Tien, Thanh Hoa. Choose a room and speak with its owner to confirm your dates, price and included services.'
        }
      }
    ],
    // Illustrative examples until the owner provides actual room inventory.
    rooms: [
      {
        id: 'sea-studio',
        propertyId: 'flamingo-hai-tien',
        name: { vi: 'Studio bên biển', en: 'Seaside Studio' },
        description: {
          vi: 'Mẫu phòng studio cho hai người. Hình ảnh minh họa; chủ phòng sẽ cung cấp ảnh và thông tin thực tế.',
          en: 'An example studio for two guests. Photos are illustrative; the owner will provide actual room images and details.'
        },
        capacity: 2,
        bedLabel: { vi: 'Giường đôi · mẫu', en: 'Double bed · example' },
        areaSqm: null,
        status: 'unconfirmed',
        blockedDates: [],
        referencePrice: null,
        currency: 'VND',
        coverImage: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1400&q=85',
        images: [
          {
            src: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1400&q=85',
            alt: { vi: 'Ảnh minh họa phòng studio', en: 'Illustrative studio interior' }
          },
          {
            src: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1400&q=85',
            alt: { vi: 'Ảnh minh họa phòng ngủ', en: 'Illustrative bedroom' }
          }
        ],
        panorama: null,
        amenities: [],
        isDemo: true
      },
      {
        id: 'twin-studio',
        propertyId: 'flamingo-hai-tien',
        name: { vi: 'Studio hai giường', en: 'Twin Studio' },
        description: {
          vi: 'Mẫu phòng hai giường cho hai người. Bố trí và tiện nghi thực tế cần được chủ phòng xác nhận.',
          en: 'An example twin room for two guests. The owner will confirm the actual layout and amenities.'
        },
        capacity: 2,
        bedLabel: { vi: 'Hai giường đơn · mẫu', en: 'Twin beds · example' },
        areaSqm: null,
        status: 'unconfirmed',
        blockedDates: [],
        referencePrice: null,
        currency: 'VND',
        coverImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=85',
        images: [
          {
            src: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=85',
            alt: { vi: 'Ảnh minh họa phòng khách sạn', en: 'Illustrative hotel room' }
          }
        ],
        panorama: null,
        amenities: [],
        isDemo: true
      },
      {
        id: 'family-suite',
        propertyId: 'flamingo-hai-tien',
        name: { vi: 'Suite gia đình', en: 'Family Suite' },
        description: {
          vi: 'Mẫu phòng dành cho nhóm bốn người. Sức chứa, số phòng ngủ và dịch vụ sẽ được xác nhận trực tiếp.',
          en: 'An example stay for a group of four. Capacity, bedrooms and included services will be confirmed directly.'
        },
        capacity: 4,
        bedLabel: { vi: 'Bố trí giường sẽ được xác nhận', en: 'Bed layout to be confirmed' },
        areaSqm: null,
        status: 'unconfirmed',
        blockedDates: [],
        referencePrice: null,
        currency: 'VND',
        coverImage: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1400&q=85',
        images: [
          {
            src: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1400&q=85',
            alt: { vi: 'Ảnh minh họa suite gia đình', en: 'Illustrative family suite' }
          }
        ],
        panorama: null,
        amenities: [],
        isDemo: true
      }
    ]
  };
});
