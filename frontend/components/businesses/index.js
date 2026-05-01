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

function filterItems(items, predicate) {
  return Array.isArray(items) ? items.filter(predicate) : [];
}

export function getBusinessTypeLabel(businessType) {
  return businessType ? businessType.split('-').join(' ') : 'business';
}

export function getBusinessPreset(businessType) {
  return businessPresets[businessType] || businessPresets.default;
}

export function getOfferings(content, businessType) {
  if (businessType === 'shopping' || businessType === 'restaurant') {
    return filterItems(content?.products, product => product?.title || product?.description || product?.category || product?.image?.url);
  }

  return filterItems(content?.services, service => service?.title || service?.description || service?.image?.url);
}

export function shouldShowOrderForm(businessType) {
  return businessType === 'restaurant' || businessType === 'shopping';
}

export function shouldShowBookingForm(businessType) {
  return businessType !== 'shopping' && !shouldShowOrderForm(businessType);
}
