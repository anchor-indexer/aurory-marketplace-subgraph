import { BigInt, log } from '@anchor-indexer/ts';
import {
  BoughtSellOrderEvent,
  CreateSellOrderCall,
  RemoveSellOrderCall,
  AddQuantityToSellOrderCall,
  CreateBuyOfferCall,
  RemoveBuyOfferCall,
  ExecuteOfferCall,
} from '../generated/Comptoir/Comptoir';
import { Listing, Offer } from '../generated/schema';

export {
  BoughtSellOrderEvent,
  CreateSellOrderCall,
  RemoveSellOrderCall,
  AddQuantityToSellOrderCall,
  CreateBuyOfferCall,
  RemoveBuyOfferCall,
  ExecuteOfferCall,
} from '../generated/Comptoir/Comptoir';
export { Listing, Offer } from '../generated/schema';

export function handleCreateSellOrderCall(call: CreateSellOrderCall): void {
  let args = call.args;
  let accounts = call.accounts;
  let id = accounts.sellOrder;
  let listing = Listing.load(id.toBase58());
  if (listing) {
    log.warning('create listing: listing {} already exists', [id.toBase58()]);
  } else {
    log.debug('create listing {}', [id.toBase58()]);
    listing = new Listing(id.toBase58());
    listing.mint = accounts.mint;
    listing.seller = accounts.payer;
    listing.destination = args.destination;
    listing.quantity = args.quantity;
    listing.price = args.price;
    listing.status = 'Listed';
    let blockTime = BigInt.fromU32(call.blockTime);
    listing.createdAt = blockTime;
    listing.updatedAt = blockTime;
    listing.save();
  }
}

export function handleRemoveSellOrderCall(call: RemoveSellOrderCall): void {
  let args = call.args;
  let accounts = call.accounts;
  let id = accounts.sellOrder;
  let listing = Listing.load(id.toBase58());
  if (!listing) {
    log.warning('remove listing: listing {} not found', [id.toBase58()]);
  } else {
    log.debug('remove listing {}', [id.toBase58()]);
    listing.quantity = listing.quantity.minus(args.quantityToUnlist);
    if (listing.quantity.isZero()) {
      listing.status = 'Unlisted';
    }
    listing.updatedAt = BigInt.fromU32(call.blockTime);
    listing.save();
  }
}

export function handleAddQuantityToSellOrderCall(
  call: AddQuantityToSellOrderCall
): void {
  let args = call.args;
  let accounts = call.accounts;
  let id = accounts.sellOrder;
  let listing = Listing.load(id.toBase58());
  if (!listing) {
    log.warning('add quantity to listing: listing {} not found', [
      id.toBase58(),
    ]);
  } else {
    log.debug('add quantity to listing {}', [id.toBase58()]);
    let quantityToAdd = args.quantityToAdd;
    listing.quantity = listing.quantity.plus(quantityToAdd);
    listing.status = 'Listed';
    listing.updatedAt = BigInt.fromU32(call.blockTime);
    listing.save();
  }
}

export function handleCreateBuyOfferCall(call: CreateBuyOfferCall): void {
  let args = call.args;
  let accounts = call.accounts;
  let id = accounts.buyOffer;
  let offer = Offer.load(id.toBase58());
  if (offer) {
    log.warning('create offer: offer {} already exists', [id.toBase58()]);
  } else {
    log.debug('create offer {}', [id.toBase58()]);
    offer = new Offer(id.toBase58());
    offer.mint = accounts.nftMint;
    offer.price = args.priceProposition;
    offer.buyer = accounts.payer;
    offer.status = 'Open';
    let blockTime = BigInt.fromU32(call.blockTime);
    offer.createdAt = blockTime;
    offer.updatedAt = blockTime;
    offer.save();
  }
}

export function handleRemoveBuyOfferCall(call: RemoveBuyOfferCall): void {
  let args = call.args;
  let accounts = call.accounts;
  let id = accounts.buyOffer;
  let offer = Offer.load(id.toBase58());
  if (!offer) {
    log.warning('remove offer: offer {} not found', [id.toBase58()]);
  } else {
    log.debug('remove offer {}', [id.toBase58()]);
    if (offer.acceptedAt) {
      log.warning('remove offer timestamp {}', [offer.acceptedAt!.toString()]);
    } else {
      log.warning('remove offer has no timestamp', []);
    }
    offer.status = 'Closed';
    offer.updatedAt = BigInt.fromU32(call.blockTime);
    offer.save();
  }
}

export function handleExecuteOfferCall(call: ExecuteOfferCall): void {
  let args = call.args;
  let accounts = call.accounts;
  let id = accounts.buyOffer;
  let offer = Offer.load(id.toBase58());
  if (!offer) {
    log.warning('offer {} not found', [id.toBase58()]);
  } else {
    log.debug('execute offer {}', [id.toBase58()]);
    offer.status = 'Closed';
    offer.seller = accounts.seller;
    let blockTime = BigInt.fromU32(call.blockTime);
    offer.acceptedAt = blockTime;
    offer.updatedAt = blockTime;
    offer.save();
  }
}

export function handleBoughtSellOrderEvent(event: BoughtSellOrderEvent): void {
  let params = event.params;
  let id = params.sellOrder.toBase58();
  let listing = Listing.load(id);
  if (!listing) {
    log.debug('listing {} not found', [id]);
  } else {
    log.debug('listing {} bought', [listing.id]);
    listing.quantity = listing.quantity.minus(params.quantity);
    listing.buyer = params.buyer;
    if (listing.quantity.equals(params.quantity)) {
      listing.status = 'Sold';
      listing.soldAt = BigInt.fromI32(event.blockTime);
    }
    listing.updatedAt = BigInt.fromI32(event.blockTime);
    listing.save();
  }
}
