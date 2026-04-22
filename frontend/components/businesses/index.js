import defaultConfig from './default/config';
import doctorConfig from './doctor/config';
import freelancerConfig from './freelancer/config';
import restaurantConfig from './restaurant/config';
import shoppingConfig from './shopping/config';
import smallBusinessConfig from './small-business/config';

export const businessPresets = {
  doctor: doctorConfig,
  restaurant: restaurantConfig,
  shopping: shoppingConfig,
  freelancer: freelancerConfig,
  'small-business': smallBusinessConfig,
  default: defaultConfig
};

export function getBusinessTypeLabel(businessType) {
  return businessType ? businessType.replace('-', ' ') : 'business';
}

export function getBusinessPreset(businessType) {
  return businessPresets[businessType] || businessPresets.default;
}

export function getOfferings(content, businessType) {
  if (businessType === 'shopping' || businessType === 'restaurant') {
    return content?.products?.filter(product => product.title || product.description || product.category || product.image?.url) || [];
  }

  return content?.services?.filter(service => service.title || service.description || service.image?.url) || [];
}

export function shouldShowOrderForm(businessType) {
  return businessType === 'restaurant';
}

export function shouldShowBookingForm(businessType) {
  return businessType !== 'shopping' && !shouldShowOrderForm(businessType);
}
