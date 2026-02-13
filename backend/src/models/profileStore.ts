import pool from '../config/database';

export interface Profile {
  id: string;
  email: string;
  username: string | null;
  isAdmin: boolean;
}

export const ProfileStore = {
    getByUserId: async (userId: string): Promise<Profile | null> => {
        const result = await pool.query(
            `SELECT id, email, username, is_admin as "isAdmin"
              FROM profiles WHERE id = $1`,
            [userId]
        );
        return result.rows[0] || null;
    },

    checkUsernameAvailable: async (username: string): Promise<boolean> => {
        const result = await pool.query(
            `SELECT 1 FROM profiles WHERE username = $1`,
            [username]
        );
        return result.rows.length === 0;
    },
};
