<?php

namespace App\Exceptions;

use Exception;

/**
 * Thrown inside a database transaction when a company's
 * active listing limit has been reached. Caught by the
 * controller to return a clean API error response.
 */
class ListingLimitReachedException extends Exception
{
    //
}
