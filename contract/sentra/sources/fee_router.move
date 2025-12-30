/// # Fee Router Module
/// 
/// ## Purpose
/// Simple fee collection system for token swaps or transfers
/// Takes a percentage fee from incoming tokens and stores in treasury
/// 
/// ## Security Model
/// - Only admin can withdraw fees or change fee percentage
/// - Maximum fee capped at 5% to prevent abuse
/// - Fees are taken from input token, not output
module sentra::fee_router;

use sui::coin::{Self, Coin};
use sui::balance::{Self, Balance};
use sui::event;


/// Caller is not the treasury admin
const ENotAdmin: u64 = 1;

/// Requested fee percentage exceeds maximum allowed
const EFeeTooHigh: u64 = 2;


/// Maximum allowed fee: 5% (500 basis points)
/// This prevents admin from setting confiscatory fee rates
const MAX_FEE_BPS: u64 = 500;

/// Basis points denominator for percentage calculations
/// 10,000 BPS = 100%
const BPS_DENOMINATOR: u64 = 10000;


public struct FeeTreasury<phantom CoinType> has key {
    id: UID,
    balance: Balance<CoinType>,
    admin: address,
    fee_bps: u64,
}

public struct SwapEvent has copy, drop {
    user: address,
    coin_in_type: vector<u8>,
    coin_out_type: vector<u8>,
    amount_in: u64,
    amount_out: u64,
    fee_amount: u64,
    timestamp: u64,
}


/// Initialize a new fee treasury for a specific token type
/// 
/// # Process
/// 1. Validates fee_bps ≤ MAX_FEE_BPS (5%)
/// 2. Creates FeeTreasury with zero balance
/// 3. Sets caller as admin
/// 4. Shares treasury object globally
/// 
public entry fun init_treasury<CoinType>(
    fee_bps: u64,
    ctx: &mut TxContext
) {
    // Enforce maximum fee limit
    assert!(fee_bps <= MAX_FEE_BPS, EFeeTooHigh);
    
    let treasury = FeeTreasury<CoinType> {
        id: object::new(ctx),
        balance: balance::zero<CoinType>(),
        admin: tx_context::sender(ctx),
        fee_bps,
    };
    
    // Share globally so integrators can use it
    transfer::share_object(treasury);
}

// ============================================================================
// Core Fee Collection
// ============================================================================

/// Take fee from input coin and return remaining amount
/// 
/// # Process
/// 1. Calculate fee: amount * fee_bps / 10000
/// 2. Split fee from input coin
/// 3. Add fee to treasury balance
/// 4. Emit SwapEvent
/// 5. Return remaining coin to caller
/// 
/// # Parameters
/// - `treasury`: The fee treasury to collect into
/// - `coin_in`: The input coin to take fee from
/// 
/// # Returns
/// Coin with fee deducted (amount_in - fee_amount)
/// 
/// # Security
/// - Fee calculation cannot overflow (uses u64 arithmetic)
/// - Original coin is consumed and replaced with reduced coin
/// - Treasury balance increases atomically
/// 
public fun take_fee_and_return<CoinIn>(
    treasury: &mut FeeTreasury<CoinIn>,
    mut coin_in: Coin<CoinIn>,
    ctx: &mut TxContext
): Coin<CoinIn> {
    let amount = coin::value(&coin_in);
    
   
    let fee_amount = (amount * treasury.fee_bps) / BPS_DENOMINATOR;

    let fee_coin = coin::split(&mut coin_in, fee_amount, ctx);
    
    balance::join(&mut treasury.balance, coin::into_balance(fee_coin));

    event::emit(SwapEvent {
        user: tx_context::sender(ctx),
        coin_in_type: b"CoinIn",     
        coin_out_type: b"CoinOut",    
        amount_in: amount,
        amount_out: 0,             
        fee_amount,
        timestamp: tx_context::epoch(ctx),
    });

    coin_in
}

public entry fun update_fee<CoinType>(
    treasury: &mut FeeTreasury<CoinType>,
    new_fee_bps: u64,
    ctx: &mut TxContext
) {
    assert!(tx_context::sender(ctx) == treasury.admin, ENotAdmin);
    
    assert!(new_fee_bps <= MAX_FEE_BPS, EFeeTooHigh);
    
    treasury.fee_bps = new_fee_bps;
}

public entry fun withdraw_fees<CoinType>(
    treasury: &mut FeeTreasury<CoinType>,
    amount: u64,
    ctx: &mut TxContext
) {
    assert!(tx_context::sender(ctx) == treasury.admin, ENotAdmin);
    
    let withdrawn = coin::take(&mut treasury.balance, amount, ctx);
    
    transfer::public_transfer(withdrawn, treasury.admin);
}


public fun get_fee_bps<CoinType>(treasury: &FeeTreasury<CoinType>): u64 {
    treasury.fee_bps
}

public fun get_collected_fees<CoinType>(treasury: &FeeTreasury<CoinType>): u64 {
    balance::value(&treasury.balance)
}

