import axios from 'axios'

export const UserService = {
    getUsers: async ({ lazyEvent }) => {
        const lazyEventObj = JSON.parse(lazyEvent);
        // Mock data for the sake of example
        const users = [
            { id: 1, name: 'Alice Smith', contactNo: '123-456-7890' },
            { id: 2, name: 'Bob Johnson', contactNo: '098-765-4321' },
            // ...more users
        ];
        return {
            totalRecords: users.length,
            users: users.slice(lazyEventObj.first, lazyEventObj.first + lazyEventObj.rows),
        };
    }
};


export const UserList = {
    getUsers: async () => {
        try {
            const response = await axios.get('http://localhost:8000/users');
            console.log(response)
            return response.data;
            
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }
};
