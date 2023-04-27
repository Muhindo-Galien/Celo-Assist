import { useState } from 'react';
import Blockies from 'react-blockies';
import { Button, Container, ModalHeader, Modal, ModalBody, ModalFooter, className, Input } from 'reactstrap';
import BigNumber from "bignumber.js";
import erc20 from '../abis/irc.abi.json';
const ERC20_DECIMALS = 18;
const contractAddress = "0x7bb2a5a715d1304C12355ad34b7CEE200DDe0791";
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";


const Index = ({requests, contract, kit, address}) => {
    const [modal, setModal] = useState(false);
    const toggle = () => setModal(!modal);
    const [requestDetails, setRequestDetails] = useState({})
    const [message, setMessage] = useState('')
    const [chats, setChats] = useState(null)
  const closeBtn = (
    <button className="close" onClick={toggle} type="button">
      &times;
    </button>
  );

  const getRequests = async function (id) {
    // let data = await contract.methods.fetchPayeeById(0).call();

    const _requests = [];
      let _request = new Promise(async (resolve, reject) => {
        let data = await contract.methods.fetchPayeeById(id).call();
        resolve({
          id: id,
          owner : data[0],
          payeeFullName : data[1],
          payeeDescription : data[2],
          networkType : data[3],
          payeeGasFee : new BigNumber(data[4]),  
        })
      }).then((result) => {
          console.log(result)
          setRequestDetails(result)
          setModal(true)
      })
      .catch((error) => console.error(error));
  }

  const fundPayee = async (_price, _index) => {
    try {
      const cUSDContract = new kit.web3.eth.Contract(erc20, cUSDContractAddress);
      const cost = new BigNumber(_price).shiftedBy(ERC20_DECIMALS).toString();

      const result = await cUSDContract.methods
        .approve(contractAddress, cost)
        .send({ from: address });

      await contract.methods.fundPayee(_index).send({ from: address });
      // return result
    //   getBalance();
    //   getRequests();

    } catch (error) {
      console.log({ error });
    }
  };
  
  const chat = async (id) => {
    try {
      await contract.methods
        .storeChatMessages(
          id, message
        )
        .send({ from: address });
      // getRequests();
      console.log('success')

    } catch (error) {
      console.log(error);
    }
  }

  const getChatsById = async function (id) {
    let data = await contract.methods.getChatsById(id).call();

    console.log(data[0][1])
    setChats(data)
  }  
    return (
        <>
<Container>         
               
                    <div className="row">
                        <center>
                    <h3 className="my-5">Requests</h3>
                    </center>
                        {requests && requests.map(request => 
                            <div className="card shadow col-lg-4 col-md-5 col-sm-12 ml-3 mr-1 mb-3 p-0">
                            <div className="card-body p-2">
                                <div className='d-flex'>
                                <div>
                                <Blockies
                                     seed= {request.owner} 
                                     size={10}
                                     scale={3} 
                                     className="identicon"
                                   />
                                </div>
                                     
                                 
                                <div className='mx-3'>
                                <h6>{request.payeeFullName}</h6>
                                    <p style={{margin : 0, padding : 0, fontSize : '12px'}}>
                                        {/* Price:${request.payeeGasFee / 10 ** 18} */}
                                        Network Type: {request.networkType}
                                    </p>
                                  
                                </div>
                                <Button size='sm' color='success' className='p-1 ml-auto'
                                     onClick={() => getRequests(request.index)}>View</Button>
                                </div>
                                            
                            </div>
                        </div>)}
                    </div>
                    </Container>  

                    <Modal isOpen={modal} toggle={toggle} className={className}>
        <ModalHeader toggle={toggle} close={closeBtn}>
         Details:
        </ModalHeader>
        <ModalBody>
        <div className="card">
                            <div className="card-body">
                                <div className='d-flex'>
                                <div>
                                <Blockies
                                     seed= {requestDetails.owner} 
                                     size={10}
                                     scale={3} 
                                     className="identicon"
                                   />
                                </div>
                                     
                                 
                                <div className='mx-3'>
                                <h6 className="title">{requestDetails.payeeFullName}</h6>
                                <p style={{fontWeight : 'bold'}} className='p-0 m-0'>Description:</p>
                                <p style={{fontSize : '15px'}} className='p-0 m-0'>{requestDetails.payeeDescription}</p>
                                <p style={{fontWeight : 'bold'}} className='p-0 m-0'>
                                        Amount:
                                        </p>
                                      <p style={{fontSize : '15px'}} className='p-0 m-0'>{requestDetails.payeeGasFee / 10 ** 18} Celo</p>

                                      <p style={{fontWeight : 'bold'}} className='p-0 m-0'>Network Type:</p>
                                    <p style={{fontSize : '15px'}} className='p-0 m-0'>{requestDetails.networkType}</p>

                                    <p style={{fontWeight : 'bold'}} className='p-0 m-0'>Wallet Address:</p>
                                    <p style={{fontSize : '15px'}} className='p-0 m-0'>{requestDetails.owner}</p>
                                    
                                    <br />
                                    <Button size='sm' color='success' 
                                onClick={() => fundPayee(requestDetails.payeeGasFee / 10 ** 18, requestDetails.id)}
                                >Transfer</Button>

                                <Button size='sm' className='mx-2' color='primary'
                                // onClick={() => getRequests(request.index)}
                                >Chat</Button>
                                </div>
                                </div>
                                </div>
                                </div>
                                <div className="card">
                            <div className="card-body">
                                <div className='d-flex align-items-center'>
                                <Input type='text' placeholder='type your message'
                                value = {message} onChange = {(e)=>setMessage(e.target.value)}
                                /> 
                                <Button onClick={() => chat(requestDetails.id)}>Send</Button> 
                                <Button onClick={() => getChatsById(requestDetails.id)}>v</Button>                                                                                        
                                </div>

                                {chats && chats.map((itm, idx) => <p>{itm[0]}</p>)}
                                </div>
                                </div>

        </ModalBody>
      </Modal>         
        </>
    )
}

export default Index;