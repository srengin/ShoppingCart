const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  console.log(state,action);
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload.data,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};




// Component being rendered
const Products = () => {
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:1337/api/products");
  
  const [cart, setCart] = useState([]);
  //const [total, setTotal] = useState(0);
  
  const {
    Card,
    Accordion,
    Button,
    Container,
    Row,
    Col,
    Image,
    Input,
  } = ReactBootstrap;
  //  Fetch Data
  
  
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    {
      data: [],
    }
  );
    console.log("hello data", data);
  const [items, setItems] = useState([]);
   
  console.log("rerendering", data, items);
  console.log(`Rendering Products ${JSON.stringify(data)}`);

  // Fetch Data
  const addToCart = (e) => {
    let name = e.target.name;   
    let item = items.filter((currentValue) => {return currentValue.name == name});
    if (item[0].instock<1) return;
    else{
    item[0].instock -= 1;
    setItems([...items]);
    console.log(`add to Cart ${JSON.stringify(item)}`);
    console.log("cart111", cart.length, cart);
    let itemInCart = [];
    let firstItemInCart={};
    if(cart.length >0){
      console.log("in first if cart");
      itemInCart = cart.filter((currentValue)=>{return currentValue.name == name});
      if(itemInCart.length>0){
        itemInCart[0].count +=1;
        setCart([...cart]);
        console.log(cart);
        console.log("in 2nd")
      }
      else{
        firstItemInCart={name: item[0].name, country:item[0].country, cost:item[0].cost, count:1};
        setCart([...cart, firstItemInCart]);
        console.log("in 3rd");
      }
    }
    else{
      firstItemInCart={name: item[0].name, country:item[0].country, cost:item[0].cost, count:1};
        setCart([...cart, firstItemInCart]);
      console.log("in 4th");
    }
  }
  };

  const deleteCartItem = (index) => {
    let item = items.filter((item)=> item.name == cart[index].name);
    if (cart[index].count==1){
      let newCart = cart.filter((item, i) => index != i);
    setCart(newCart);
    }
    else{
    cart[index].count -= 1;
    setCart([...cart]);
    }
    item[0].instock += 1;
    setItems([...items]);
  };

 
  let list= items.map((item, index) => {
    let n = index + 1049;
    let url = "https://picsum.photos/id/" + n + "/70";
    return (
      <li key={index}>
        <Image src={url} width={70} roundedCircle></Image>
        <Button variant="primary" size="large">
          {item.name}:  ${item.cost} <br /> Only {item.instock} in stock.
        </Button>
        <input name={item.name} type="submit" onClick={addToCart} value="Add to Cart"></input>
      </li>
  )});




  let cartList = cart.map((currentValue, index) => {
    return (
      <Card key={index}>
        <Card.Header>
          <Accordion.Toggle as={Button} variant="link" eventKey={1 + index}>
           {currentValue.count} x {currentValue.name}
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse
          onClick={() => deleteCartItem(index)}
          eventKey={1 + index}
        >
          <Card.Body>
            $ {currentValue.cost} from {currentValue.country}
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    )});

  let finalList = () => {
    let total1 = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
         {item.count} | {item.name}
        </div>
      );
    });
    return { final, total1 };
  };

  const checkOut = () => {
    console.log(cart);
    if (cart.length > 0) {
    let costs = cart.map((item) => item.cost*item.count);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;}
  };
  // TODO: implement the restockProducts function
  const stockProducts = (url) => {
    doFetch(url);
    let newItems1 = data.map((item) => {
      let {name, country, cost, instock} = item.attributes;
      return {name, country, cost, instock};
  })
    setItems([...items, ...newItems1]);
  };

  const restockProducts = (url) => {
    doFetch(url);
    data.map((item) => {
      let {name, country, cost, instock} = item.attributes;
      let newStock = items.filter((item) => item.name ===name);
      newStock[0].instock += instock;
  });
  setItems([...items]);
  };



  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          {(items.length> 0 ) && <ul style={{ listStyleType: "none" }}> {list} </ul>}
          {(data.length > 0 && items.length ==0) && stockProducts(query)}
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          {(cart.length > 0) && <Accordion>{cartList}</Accordion>}
          
        </Col>
        <Col>
          <h1>CheckOut </h1>
          
          <Button onClick={checkOut}>CheckOut $ {finalList().total1}</Button>
          <div> {finalList().total1 > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(`http://localhost:1337/api/products`);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
