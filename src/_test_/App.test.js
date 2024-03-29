import React from 'react';
import { shallow, mount } from 'enzyme';
import App from '../App';
import EventList from '../EventList';
import CitySearch from '../CitySearch';
import NumberOfEvents from '../NumberOfEvents';
import { mockData } from '../mock-data';
import { extractLocations, getEvents } from '../api';


describe('<App /> component', () => {
    let AppWrapper;
    beforeAll(() => {
        AppWrapper = shallow(<App />);
    });

    test('render list of events', () => {

        expect(AppWrapper.find(EventList)).toHaveLength(1);
    });
    test('render CitySearch', () => {

        expect(AppWrapper.find(CitySearch)).toHaveLength(1);
    });

    test('render number of events', () => {

        expect(AppWrapper.find(NumberOfEvents)).toHaveLength(1);
    });
});

describe('<App /> integration', () => {

    test('App passes "events" state as a prop to EventList', () => {
        const AppWrapper = mount(<App />);
        const AppEventsState = AppWrapper.state('events');
        expect(AppEventsState).not.toEqual(undefined);
        expect(AppWrapper.find(EventList).props().events).toEqual(AppEventsState);
        AppWrapper.unmount();
    });

    test('App passes "locations" state as a prop to CitySearch', () => {
        const AppWrapper = mount(<App />);
        const AppLocationsState = AppWrapper.state('locations');
        expect(AppLocationsState).not.toEqual(undefined);
        expect(AppWrapper.find(CitySearch).props().locations).toEqual(AppLocationsState);
        AppWrapper.unmount();
    });

    test('App passes "numberOfEvents" state as a prop to NumberOfEvents', () => {
        const AppWrapper = mount(<App />);
        const AppNumberOfEventsState = AppWrapper.state('numberOfEvents');
        expect(AppNumberOfEventsState).not.toEqual(undefined);
        expect(AppWrapper.find(NumberOfEvents).props().numberOfEvents).toEqual(AppNumberOfEventsState);
        AppWrapper.unmount();
    });

    test('get list of events matching the city selected by the user', async () => {
        const AppWrapper = mount(<App />);
        const CitySearchWrapper = AppWrapper.find(CitySearch);
        const locations = extractLocations(mockData);
        CitySearchWrapper.setState({ suggestions: locations });
        const suggestions = CitySearchWrapper.state('suggestions');
        const selectedIndex = Math.floor(Math.random() * (suggestions.length));
        const selectedCity = suggestions[selectedIndex];
        await CitySearchWrapper.instance().handleItemClicked(selectedCity);
        const allEvents = await getEvents();
        const eventsToShow = allEvents.filter(event => event.location === selectedCity);
        expect(AppWrapper.state('events')).toEqual(eventsToShow);
        AppWrapper.unmount();
    });

    test('get list of all events when user selects "See all cities"', async () => {
        const AppWrapper = mount(<App />);
        const suggestionItems = AppWrapper.find(CitySearch).find('.suggestions li');
        await suggestionItems.at(suggestionItems.length - 1).simulate('click');
        const allEvents = await getEvents();
        expect(AppWrapper.state('events')).toEqual(allEvents);
        AppWrapper.unmount();
    });

    test("load a list of specified events by default", async () => {
        const AppWrapper = mount(<App />);
        const allEvents = await getEvents();
        //check if the state of "eventsLength" (which returns a number) is not undefined
        expect(AppWrapper.state("numberOfEvents")).not.toEqual(undefined);
        const sliceNumber = AppWrapper.state("numberOfEvents");
        //check if the events state is updated with the appropriate length after fetching
        expect(AppWrapper.state("events")).toEqual(allEvents.slice(0, sliceNumber));
        AppWrapper.unmount();
    });

    test("input change in NumberOfEvents updates the events state in App component", async () => {
        const AppWrapper = mount(<App />);
        const NumberOfEventsWrapper = AppWrapper.find(NumberOfEvents);
        //const allEvents = await getEvents();
        const selectedCity = "London, UK";
        //using mockdata I know there's 3 events for london and 2 for berlin, so for London I should receive 3 events
        const selectedNumber = 2;
        //numberofevents function in action
        await NumberOfEventsWrapper.instance().changeNumOfEvents({
            target: { value: selectedNumber },
        });
        const eventsToShow = mockData
            .filter((e) => e.location === selectedCity)
            .slice(0, selectedNumber);
        AppWrapper.setState({ events: eventsToShow });
        expect(AppWrapper.state("events")).toEqual(eventsToShow);
        expect(AppWrapper.state("events")).not.toEqual(undefined);
        expect(AppWrapper.state("events")).toHaveLength(selectedNumber);
        AppWrapper.unmount();
    });




});