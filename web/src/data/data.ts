// Mağaza veri tipleri.
//
// Bu dosya önceden template'in (Ciseco) demo verisini içeriyordu: "Ethiopia Yirgacheffe ₺85",
// "Single Origin" koleksiyonu, demo blog yazıları, sahte yorumlar/siparişler… API hata verince
// ya da bazı bileşenlerde doğrudan bu demo ürünler sitede görünüyordu. Demo veri tamamen
// kaldırıldı; burada yalnızca bileşenlerin kullandığı veri şekilleri (tipler) duruyor.
// Gerçek veri backend'den gelir ve lib/adapters.ts ile bu şekillere dönüştürülür.

import type { StaticImageData } from 'next/image'

type CollectionShape = {
  id: string;
  title: string;
  handle: string;
  description: string;
  sortDescription: string;
  color: string;
  count: number;
  image: {
    src: string;
    width: number;
    height: number;
    alt: string;
  };
}

type ProductShape = {
  id: string;
  title: string;
  handle: string;
  createdAt: string;
  vendor: string;
  price: number;
  featuredImage: {
    src: string;
    width: number;
    height: number;
    alt: string;
  };
  images: {
    src: string;
    width: number;
    height: number;
    alt: string;
  }[];
  reviewNumber: number;
  rating: number;
  status: string;
  options: ({
    name: string;
    optionValues: {
      name: string;
      swatch: {
        color: string;
        image: null;
      };
    }[];
  } | {
    name: string;
    optionValues: {
      swatch: null;
      name: string;
    }[];
  })[];
  selectedOptions: {
    name: string;
    value: string;
  }[];
}

type ProductDetailShape = {
  status: string;
  breadcrumbs: {
    id: number;
    name: string;
    href: string;
  }[];
  description: string;
  publishedAt: string;
  selectedOptions: {
    name: string;
    value: string | undefined;
  }[];
  features: string[];
  careInstruction: string;
  shippingAndReturn: string;
  id: string;
  title: string;
  handle: string;
  createdAt: string;
  vendor: string;
  price: number;
  featuredImage: {
    src: string;
    width: number;
    height: number;
    alt: string;
  };
  images: {
    src: string;
    width: number;
    height: number;
    alt: string;
  }[];
  reviewNumber: number;
  rating: number;
  options: ({
    name: string;
    optionValues: {
      name: string;
      swatch: {
        color: string;
        image: null;
      };
    }[];
  } | {
    name: string;
    optionValues: {
      swatch: null;
      name: string;
    }[];
  })[];
}

type CartShape = {
  id: string;
  note: string;
  createdAt: string;
  totalQuantity: number;
  cost: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    discount: number;
  };
  lines: ({
    id: string;
    name: string;
    handle: string;
    price: number;
    color: string;
    inStock: boolean;
    size: string;
    quantity: number;
    image: {
      src: string;
      width: number;
      height: number;
      alt: string;
    };
    leadTime?: undefined;
  } | {
    id: string;
    name: string;
    handle: string;
    price: number;
    color: string;
    inStock: boolean;
    leadTime: string;
    size: string;
    quantity: number;
    image: {
      src: string;
      width: number;
      height: number;
      alt: string;
    };
  })[];
}

type BlogPostShape = {
  id: string;
  title: string;
  handle: string;
  excerpt: string;
  featuredImage: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  date: string;
  datetime: string;
  category: {
    title: string;
    href: string;
  };
  timeToRead: string;
  author: {
    name: string;
    avatar: {
      src: string;
      alt: string;
      width: number;
      height: number;
    };
    description: string;
  };
}

type ReviewShape = {
  id: string;
  title: string;
  rating: number;
  content: string;
  author: string;
  authorAvatar: StaticImageData;
  date: string;
  datetime: string;
}

type OrderShape = {
  number: string;
  date: string;
  status: string;
  invoiceHref: string;
  totalQuantity: number;
  cost: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    discount: number;
  };
  products: {
    id: string;
    title: string;
    handle: string;
    description: string;
    href: string;
    price: number;
    status: string;
    step: number;
    date: string;
    datetime: string;
    address: string[];
    email: string;
    phone: string;
    featuredImage: {
      src: string;
      width: number;
      height: number;
      alt: string;
    };
    quantity: number;
    size: string;
    color: string;
  }[];
}

export type TCollection = Partial<CollectionShape>
export type TProductItem = Partial<ProductShape>
export type TProductDetail = Partial<ProductDetailShape>
export type TCardProduct = Partial<CartShape['lines'][number]>
export type TBlogPost = Partial<BlogPostShape>
export type TReview = Partial<ReviewShape>
export type TOrder = Partial<OrderShape>
