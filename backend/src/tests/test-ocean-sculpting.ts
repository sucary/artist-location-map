import pool from '../config/database';
import { CityService } from '../services/cityService';

async function testOceanSculpting() {
    console.log('Starting Ocean Sculpting Test...');
    
    const testCity = {
        name: 'Fukuoka',
        province: 'Fukuoka'
    };

    try {
        await pool.query('DELETE FROM artists WHERE original_city = $1 OR active_city = $1', [testCity.name]);
        await pool.query('DELETE FROM city_boundaries WHERE name = $1', [testCity.name]);
        console.log(`Cleaned up existing data for ${testCity.name}`);

        console.log(`Fetching ${testCity.name} from Nominatim and saving...`);
        const city = await CityService.getCity(testCity.name, testCity.province);

        console.log('City saved successfully!');
        console.log('ID:', city.id);
        console.log('Center:', city.center);
        
        const checkResult = await pool.query(`
            SELECT EXISTS (
                SELECT 1 
                FROM water_polygons 
                WHERE ST_Intersects(
                    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography::geometry, 
                    geom::geometry
                )
            ) as is_in_water
        `, [city.center.lng, city.center.lat]);

        const isInWater = checkResult.rows[0].is_in_water;
        console.log(`\nVerification: Is the new center in water? ${isInWater ? 'YES (FAIL)' : 'NO (PASS)'}`);

        if (!isInWater) {
            console.log('SUCCESS: The city center was successfully placed on land.');
        } else {
            console.error('FAILURE: The city center is still in the water.');
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await pool.end();
    }
}

testOceanSculpting();