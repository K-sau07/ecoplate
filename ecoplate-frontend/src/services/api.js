import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// Get token from localStorage
const getAuthHeader = () => {
	const token = localStorage.getItem("token");
	return token ? { Authorization: `Bearer ${token}` } : {};
};

// Auth Services
export const authService = {
	login: async (email, password) => {
		const response = await axios.post(
			`${API_BASE_URL}/auth/login`,
			{ email, password }
		);
		return response.data;
	},

	signup: async (userData) => {
		const response = await axios.post(
			`${API_BASE_URL}/auth/signup`,
			userData
		);
		return response.data;
	},

	logout: () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
	},
};

// Food Item Services
export const foodItemService = {
	getAll: async () => {
		const response = await axios.get(`${API_BASE_URL}/food-items`, {
			headers: getAuthHeader(),
		});
		return response.data;
	},

	getMyItems: async () => {
		const response = await axios.get(
			`${API_BASE_URL}/food-items/my-items`,
			{
				headers: getAuthHeader(),
			}
		);
		return response.data;
	},

	getById: async (id) => {
		const response = await axios.get(
			`${API_BASE_URL}/food-items/${id}`,
			{
				headers: getAuthHeader(),
			}
		);
		return response.data;
	},

	getByCategory: async (category) => {
		const response = await axios.get(
			`${API_BASE_URL}/food-items/category/${category}`,
			{
				headers: getAuthHeader(),
			}
		);
		return response.data;
	},

	create: async (itemData) => {
		const response = await axios.post(
			`${API_BASE_URL}/food-items`,
			itemData,
			{
				headers: getAuthHeader(),
			}
		);
		return response.data;
	},

	delete: async (id) => {
		const response = await axios.delete(
			`${API_BASE_URL}/food-items/${id}`,
			{
				headers: getAuthHeader(),
			}
		);
		return response.data;
	},

	getAllDonations: async () => {
		const response = await axios.get(
			`${API_BASE_URL}/food-items/donations`,
			{
				headers: getAuthHeader(),
			}
		);
		return response.data;
	},

	markAsDonation: async (id) => {
		const response = await axios.put(
			`${API_BASE_URL}/food-items/${id}/mark-donation`,
			{},
			{
				headers: getAuthHeader(),
			}
		);
		return response.data;
	},
};

// Donation Services
export const donationService = {
	claimDonation: async (claimData) => {
		const response = await axios.post(
			`${API_BASE_URL}/donations/claim`,
			claimData,
			{
				headers: getAuthHeader(),
			}
		);
		return response.data;
	},

	getNgoClaims: async () => {
		const response = await axios.get(
			`${API_BASE_URL}/donations/ngo/claims`,
			{
				headers: getAuthHeader(),
			}
		);
		return response.data;
	},

	getStoreClaims: async () => {
		const response = await axios.get(
			`${API_BASE_URL}/donations/store/claims`,
			{
				headers: getAuthHeader(),
			}
		);
		return response.data;
	},

	getStorePendingClaims: async () => {
		const response = await axios.get(
			`${API_BASE_URL}/donations/store/claims/pending`,
			{
				headers: getAuthHeader(),
			}
		);
		return response.data;
	},

	updateClaimStatus: async (claimId, status, storeResponse) => {
		const response = await axios.put(
			`${API_BASE_URL}/donations/claims/${claimId}/status`,
			{ status, storeResponse },
			{ headers: getAuthHeader() }
		);
		return response.data;
	},
};

// Store Services
export const storeService = {
	createOrUpdateStore: async (storeData) => {
		const response = await axios.post(
			`${API_BASE_URL}/stores/profile`,
			storeData,
			{
				headers: getAuthHeader(),
			}
		);
		return response.data;
	},

	getMyStore: async () => {
		const response = await axios.get(
			`${API_BASE_URL}/stores/my-store`,
			{
				headers: getAuthHeader(),
			}
		);
		return response.data;
	},
};

// Notification Services
export const notificationService = {
	getAll: async () => {
		const response = await axios.get(
			`${API_BASE_URL}/notifications`,
			{
				headers: getAuthHeader(),
			}
		);
		return response.data;
	},

	getUnreadCount: async () => {
		const response = await axios.get(
			`${API_BASE_URL}/notifications/unread-count`,
			{
				headers: getAuthHeader(),
			}
		);
		return response.data;
	},

	markAsRead: async (id) => {
		await axios.put(
			`${API_BASE_URL}/notifications/${id}/read`,
			{},
			{
				headers: getAuthHeader(),
			}
		);
	},

	markAllAsRead: async () => {
		await axios.put(
			`${API_BASE_URL}/notifications/mark-all-read`,
			{},
			{
				headers: getAuthHeader(),
			}
		);
	},
};

// Order Services
export const orderService = {
	getMyOrders: async () => {
		const response = await axios.get(
			`${API_BASE_URL}/orders/my-orders`,
			{
				headers: getAuthHeader(),
			}
		);
		return response.data;
	},

	createOrder: async (orderData) => {
		const response = await axios.post(
			`${API_BASE_URL}/orders`,
			orderData,
			{
				headers: getAuthHeader(),
			}
		);
		return response.data;
	},
};

export default {
	auth: authService,
	foodItems: foodItemService,
	donations: donationService,
	stores: storeService,
	notifications: notificationService,
	orders: orderService,
};
