import { useState } from 'react';
import { hotels } from '../data/hotels';
import { restaurants } from '../data/restaurants';
import { flights } from '../data/flights';
import ResultMessage from './ResultMessage';
import '../styles/main.css';

export default function TravelForm() {
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [hotel, setHotel] = useState(hotels[0].name);
  const [restaurant, setRestaurant] = useState(restaurants[0].name);
  const [flight, setFlight] = useState(flights[0].name);
  const [total, setTotal] = useState(null);

  const calculateTotal = () => {
    const hotelPrice = hotels.find(h => h.name === hotel).price;
    const restaurantPrice = restaurants.find(r => r.name === restaurant).price;
    const flightPrice = flights.find(f => f.name === flight).price;

    const totalCost = (adults + children) * hotelPrice + restaurantPrice + flightPrice;
    setTotal(totalCost);
  };

  return (
    <div className="card">
      <h2>Reserva tu Combo de Viaje</h2>
      <p>El precio del hotel se ajusta por persona y el vuelo incluye ida y vuelta.</p>

      <label>Adultos:</label>
      <input type="number" value={adults} min="0" onChange={e => setAdults(+e.target.value)} />

      <label>Niños:</label>
      <input type="number" value={children} min="0" onChange={e => setChildren(+e.target.value)} />

      <label>Selecciona un hotel:</label>
      <select value={hotel} onChange={e => setHotel(e.target.value)}>
        {hotels.map(h => <option key={h.name}>{h.name}</option>)}
      </select>

      <label>Selecciona un restaurante:</label>
      <select value={restaurant} onChange={e => setRestaurant(e.target.value)}>
        {restaurants.map(r => <option key={r.name}>{r.name}</option>)}
      </select>

      <label>Selecciona un vuelo de ida y vuelta:</label>
      <select value={flight} onChange={e => setFlight(e.target.value)}>
        {flights.map(f => <option key={f.name}>{f.name}</option>)}
      </select>

      <button onClick={calculateTotal}>Calcular Costo Total</button>

      {total !== null && <ResultMessage total={total} />}
    </div>
  );
}
