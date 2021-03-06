// dependencies
import React from 'react';
import { shallow } from 'enzyme';

// components
import Header from './Header';

describe('<Header />', () => {
  let props, wrapper;

  beforeEach(() => {
    props = {
      modal: false,
      lives: 1,
      score: 0,
    };
    wrapper = shallow(<Header {...props} />);
  });

  it('should render the <Lives /> component when modal:false', () => {
    expect(
      wrapper.find('Lives').length
    ).toBe(1);
  });

  it('<Lives /> should have props for lives when modal:false', () => {
    expect(
      wrapper.find('Lives').props().lives
    ).toBeDefined();
  });  

  it('should render the <Score /> component when modal:false', () => {
    expect(
      wrapper.find('Score').length
    ).toBe(1);
  });

  it('<Score /> component should pass props when modal:false', () => {
    expect(
      wrapper.find('Score').props().score
    ).toBeDefined();
  });

  it('should render the <Logo /> component when modal:true', () => {
    props.modal = !props.modal;
    wrapper = shallow(<Header {...props} />);
    expect(
      wrapper.find('Logo').length
    ).toBe(1);
  });

  it('<Logo /> component should pass props when modal:true', () => {
    props.modal = !props.modal;
    wrapper = shallow(<Header {...props} />);
    expect(
      wrapper.find('Logo').props().logo
    ).toBeDefined();
  });

});
